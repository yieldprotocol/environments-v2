/**
 * @dev This script makes one or more assets into bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the lending oracle and allow the Witch to liquidate debt.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { ethers } from 'hardhat'

import { id } from '@yield-protocol/utils-v2'
import { bytesToString, bytesToBytes32 } from '../../shared/helpers'
import { CHI, RATE } from '../../shared/constants'

import { Wand, Join, EmergencyBrake, IOracle } from '../../typechain'

export const makeIlkProposal = async (
  ownerAcc: any, 
  protocol: Map<string, string>,
  joins: Map<string, string>,
  wand: Wand,
  cloak: EmergencyBrake,
  bases: Array<[string, string]>
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, oracleName] of bases) {
    const join = (await ethers.getContractAt('Join', joins.get(assetId) as string, ownerAcc)) as Join

    // Test that the sources for rate and chi have been set. Peek will fail with 'Source not found' if they have not.
    const rateChiOracle = (await ethers.getContractAt(
      'IOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as IOracle
    console.log(
      `Current RATE for ${bytesToString(assetId)}: ${
        (await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(RATE), 0))[0]
      }`
    )
    console.log(
      `Current CHI for ${bytesToString(assetId)}: ${
        (await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(CHI), 0))[0]
      }`
    )

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeBase', [assetId, rateChiOracle.address]),
    })
    console.log(`[Asset: ${bytesToString(assetId)} made into base using ${rateChiOracle.address}],`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [protocol.get('witch') as string, plan]),
    })
    console.log(
      `cloak.plan(witch, join(${bytesToString(assetId)})): ${await cloak.hash(protocol.get('witch') as string, plan)}`
    )
  }

  return proposal
}