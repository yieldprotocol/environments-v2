/**
 * @dev This script replaces join for an asset
 *
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import { Ladle, Join, Timelock, EmergencyBrake } from '../../../typechain'

export const replaceJoinProposal = async (
  ownerAcc: any,
  deployer: string,
  ladle: Ladle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [assetId, assetAddress, joinAddress] of assets) {
    const join = (await ethers.getContractAt('Join', joinAddress, ownerAcc)) as Join

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
    })
    console.log(`join.revokeRole(ROOT, deployer)`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`join.grantRole(ROOT, cloak)`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(ladle.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
      })
      console.log(`cloak.plan(ladle, join(${bytesToString(assetId)})): ${await cloak.hash(ladle.address, plan)}`)
    }

    // Allow Ladle to join and exit on the asset Join
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
        ladle.address,
      ]),
    })

    // Register the Join in the Ladle
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addJoin', [assetId, joinAddress]),
    })
  }

  return proposal
}
