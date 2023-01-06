/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { Cauldron, IOracle, Join__factory, OldEmergencyBrake, Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'
import { setLineAndLimitProposal } from '../liquidations/setLineAndLimitProposal'

export const makeIlkProposal = async (
  ownerAcc: SignerWithAddress,
  cloak: OldEmergencyBrake,
  spotOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  debtLimits: Array<[string, string, number, number, number, number]>,
  auctionLineAndLimits: AuctionLineAndLimit[],
  joins: Map<string, string> // assetId, joinAddress
): Promise<Array<{ target: string; data: string }>> => {
  const proposal = setLineAndLimitProposal(witch, auctionLineAndLimits)

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
      console.log(`cloak.plan(witch, exit(${getName(ilkId)})): ${await cloak.hash(witch.address, plan)}`)
    }
  }

  for (let [baseId, ilkId, ratio, line, dust, dec] of debtLimits) {
    console.log(
      `Setting spot oracle for ${getName(baseId)}/${getName(ilkId)} to address: ${
        spotOracle.address
      }, ratio: ${ethers.utils.formatUnits(ratio, 6)}`
    )
    // Set the spot oracle in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, spotOracle.address, ratio]),
    })

    console.log(
      `Setting debt limits for ${getName(baseId)}/${getName(
        ilkId
      )} maxDebt: ${line}, minDebt: ${dust}, decimals: ${dec}`
    )
    // Set the base/ilk limits in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, line, dust, dec]),
    })
  }

  return proposal
}
