/**
 * @dev This script adds one or more assets to the protocol.
 *
 * It uses the Wand to:
 *  - Add the asset to Cauldron.
 *  - Deploy a new Join, which gets added to the Ladle, which gets permissions to join and exit.
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString } from '../../../shared/helpers'

import { Cauldron, Ladle, Join, ERC20Mock } from '../../../typechain'
import { ZERO_ADDRESS } from '../../../shared/constants'

export const addAssetProposal = async (
  ownerAcc: any,
  cauldron: Cauldron,
  ladle: Ladle,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, assetAddress, joinAddress] of assets) {
    if ((await ethers.provider.getCode(assetAddress)) === '0x') throw `Address ${assetAddress} contains no code`
    const asset = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      assetAddress as string,
      ownerAcc
    )) as unknown as ERC20Mock
    //console.log(`Using ${await asset.name()} at ${assetAddress}`)
    console.log(assetAddress)

    if ((await ethers.provider.getCode(joinAddress)) === '0x') throw `Address ${joinAddress} contains no code`
    const join: Join = (await ethers.getContractAt('Join', joinAddress, ownerAcc)) as Join
    //console.log(`Using ${await asset.name()} join at ${joinAddress}`)
    console.log(joinAddress)

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
  }

  return proposal
}
