/**
 * @dev This script adds one or more assets to the protocol.
 *
 * It uses the Wand to:
 *  - Add the asset to Cauldron.
 *  - Deploy a new Join, which gets added to the Ladle, which gets permissions to join and exit.
 * @notice The assetIds can't be already in use
 */

import { id } from '@yield-protocol/utils-v2'
import { ethers } from 'hardhat'
import { ZERO_ADDRESS } from '../../../shared/constants'
import { EmergencyBrake, Cauldron, Ladle } from '../../../typechain'

export const addAssetProposal = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  ladle: Ladle,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, assetAddress, joinAddress] of assets) {
    if ((await ethers.provider.getCode(assetAddress)) === '0x') throw `Address ${assetAddress} contains no code`
    console.log(`Using asset at ${assetAddress}`)

    if ((await ethers.provider.getCode(joinAddress)) === '0x') throw `Address ${joinAddress} contains no code`
    const join = await ethers.getContractAt('Join', joinAddress, ownerAcc)
    console.log(`Using join at ${joinAddress}`)

    if ((await cauldron.assets(assetId)) === ZERO_ADDRESS) {
      // Add asset to Cauldron
      proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('addAsset', [assetId, assetAddress]),
      })
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

    console.log(`Adding asset ${assetId} at ${assetAddress} with join ${joinAddress}`)

    const plan = [
      {
        contact: ladle.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(ladle.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
      })
      console.log(`cloak.plan(join, join(${bytesToString(assetId)})): ${await cloak.hash(join.address, plan)}`)
    }
  }

  return proposal
}
