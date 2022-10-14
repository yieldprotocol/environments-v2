/**
 * @dev This script makes one or more assets into bases.
 *
 * It takes as inputs the governance and protocol address files.
 * Sets the lending oracle and allows the Witch to liquidate debt.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { id } from '@yield-protocol/utils-v2'
import { bytesToBytes32, bytesToString } from '../../../shared/helpers'
import { CHI, RATE } from '../../../shared/constants'
import { Cauldron, EmergencyBrake, IOracle, Join__factory, Witch } from '../../../typechain'

export const makeBaseProposal = async (
  ownerAcc: any,
  lendingOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  cloak: EmergencyBrake,
  bases: Array<[string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, joinAddress] of bases) {
    const join = Join__factory.connect(joinAddress, ownerAcc)

    // Test that the sources for rate and chi have been set. Peek will fail with 'Source not found' if they have not.
    proposal.push({
      target: lendingOracle.address,
      data: lendingOracle.interface.encodeFunctionData('peek', [bytesToBytes32(assetId), bytesToBytes32(RATE), 0]),
    })
    proposal.push({
      target: lendingOracle.address,
      data: lendingOracle.interface.encodeFunctionData('peek', [bytesToBytes32(assetId), bytesToBytes32(CHI), 0]),
    })

    // Allow Witch to join base
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [
        id(join.interface, 'join(address,uint128)'),
        witch.address,
      ]),
    })

    // Allow to revoke the above permission on emergencies
    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(witch.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [witch.address, plan]),
      })
      console.log(`cloak.plan(witch, join(${bytesToString(assetId)})): ${await cloak.hash(witch.address, plan)}`)
    }

    // Add the asset as a base
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setLendingOracle', [assetId, lendingOracle.address]),
    })
    console.log(`Asset ${bytesToString(assetId)} made into base using ${lendingOracle.address}`)
  }

  return proposal
}
