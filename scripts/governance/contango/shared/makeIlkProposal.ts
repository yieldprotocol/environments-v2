/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { bytesToBytes32, bytesToString } from '../../../../shared/helpers'
import { Cauldron, ContangoWitch, EmergencyBrake, IOracle, Join__factory } from '../../../../typechain'
import { AuctionLineAndLimit } from '../../confTypes'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { WAD } from '../../../../shared/constants'

export const makeIlkProposal = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  spotOracle: IOracle,
  cauldron: Cauldron,
  witch: ContangoWitch,
  debtLimits: Array<[string, string, number, number, number, number]>,
  auctionLineAndLimits: AuctionLineAndLimit[],
  joins: Map<string, string> // assetId, joinAddress
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (const { ilkId, baseId, duration, vaultProportion, collateralProportion, max } of auctionLineAndLimits) {
    console.log(
      `Witch#setLineAndLimit(${bytesToString(ilkId)}, ${bytesToString(
        baseId
      )}, ${duration}, ${vaultProportion}, ${collateralProportion}, ${max})`
    )
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setLineAndLimit', [
        ilkId,
        baseId,
        duration,
        vaultProportion,
        collateralProportion,
        max,
      ]),
    })
  }

  const ilkIds = new Set(auctionLineAndLimits.map(({ ilkId }) => ilkId))
  for (const ilkId of ilkIds) {
    const join = Join__factory.connect(joins.get(ilkId)!, ownerAcc)

    console.log(`Allowing witch to exit join: ${join.address}`)

    // Allow Witch to exit ilk
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [
        id(join.interface, 'exit(address,uint128)'),
        witch.address,
      ]),
    })

    // Log a plan to undo the orchestration above in emergencies
    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'exit(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(witch.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [witch.address, plan]),
      })
      console.log(`cloak.plan(witch, exit(${bytesToString(ilkId)})): ${await cloak.hash(witch.address, plan)}`)
    }
  }

  for (let [baseId, ilkId, ratio, line, dust, dec] of debtLimits) {
    // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
    console.log(`Adding for ${bytesToString(baseId)}/${bytesToString(ilkId)} from ${spotOracle.address as string}`)
    proposal.push({
      target: spotOracle.address,
      data: spotOracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD]),
    })

    // Set the spot oracle in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, spotOracle.address, ratio]),
    })

    // Set the base/ilk limits in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, line, dust, dec]),
    })
  }

  return proposal
}
