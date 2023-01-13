/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../shared/helpers'
import { AuctionLineAndLimit } from '../../governance/confTypes'

import { IOracle, Cauldron, Witch, Join__factory, OldEmergencyBrake } from '../../../typechain'

export const makeIlkProposal = async (
  ownerAcc: any,
  spotOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  cloak: OldEmergencyBrake,
  joins: Map<string, string>,
  debtLimits: Array<[string, string, number, number, number, number]>,
  auctionLineAndLimits: AuctionLineAndLimit[]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let auction of auctionLineAndLimits) {
    console.log(auction.ilkId)
    const join = Join__factory.connect(joins.getOrThrow(auction.ilkId)!, ownerAcc)

    // Configure auction limits for the ilk on the witch
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setLineAndLimit', [
        auction.ilkId,
        auction.baseId,
        auction.duration,
        auction.vaultProportion,
        auction.collateralProportion,
        auction.max,
      ]),
    })
    console.log(`Asset ${getName(auction.ilkId)} set as ilk on witch at ${witch.address}`)

    // Allow Witch to exit ilk
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'exit(address,uint128)')],
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
      console.log(`cloak.plan(witch, join(${getName(auction.ilkId)})): ${await cloak.hash(witch.address, plan)}`)
    }
  }

  for (let [baseId, ilkId, ratio, line, dust, dec] of debtLimits) {
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
