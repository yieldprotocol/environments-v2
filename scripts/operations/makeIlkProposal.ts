/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, bytesToBytes32, jsonToMap } from '../../shared/helpers'
import { WAD } from '../../shared/constants'

import { Witch, Wand, Join, ChainlinkMultiOracle, EmergencyBrake } from '../../typechain'

export const makeIlkProposal = async (
  ownerAcc: any, 
  protocol: Map<string, string>,
  joins: Map<string, string>,
  witch: Witch,
  wand: Wand,
  cloak: EmergencyBrake,
  ilks: Array<[string, string, string, number, number, number, number, number]>
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  const plans: Array<string> = new Array() // Existing plans in the cloak
  for (let [baseId, ilkId, oracleName, ratio, invRatio, line, dust, dec] of ilks) {
    const join = (await ethers.getContractAt('Join', joins.get(ilkId) as string, ownerAcc)) as Join

    // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
    const spotOracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get(oracleName) as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    console.log(`Adding for ${bytesToString(baseId)}/${bytesToString(ilkId)} from ${protocol.get(oracleName) as string}`)
    proposal.push({
      target: spotOracle.address,
      data: spotOracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD]),
    })

    if (!plans.includes(ilkId) && !((await witch.limits(ilkId)).line.toString() !== '0')) {
      proposal.push({
        target: witch.address,
        data: witch.interface.encodeFunctionData('setIlk', [
          ilkId,
          60 * 60,
          invRatio,
          line,
          dust,
          dec, // ilkId, duration, initialOffer, line, dust, dec
        ]),
      })
      console.log(`[Asset: ${bytesToString(ilkId)} set as ilk on witch at ${witch.address}],`)
    }

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('makeIlk', [baseId, ilkId, spotOracle.address, ratio, line, dust, dec]),
    })
    console.log(`[Asset: ${bytesToString(ilkId)} made into ilk for ${bytesToString(baseId)}],`)

    if (!plans.includes(ilkId) && !((await witch.limits(ilkId)).line.toString() !== '0')) {
      const plan = [
        {
          contact: join.address,
          signatures: [id(join.interface, 'exit(address,uint128)')],
        },
      ]

      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [protocol.get('witch') as string, plan]),
      })
      console.log(
        `cloak.plan(witch, join(${bytesToString(ilkId)})): ${await cloak.hash(protocol.get('witch') as string, plan)}`
      )

      plans.push(ilkId)
    }
  }

  return proposal
}