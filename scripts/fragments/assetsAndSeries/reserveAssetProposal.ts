/**
 * @dev This script adds one or more assets to the cauldron, without deploying a Join or any permissioning.
 * The purpose is to reserve assetIds in the cauldron, since there might be assets (such as stEth) that we don't
 * accept as collateral, but whose asset ids we use in the oracles. The cauldron is the asset registry, so those cases
 * should be recorded. Otherwise we might be using an asset id for stEth in the oracles, and then reuse that same asset id
 * for a different asst in the Cauldron and Ladle.
 *
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'

import { Cauldron } from '../../../typechain'

export const reserveAssetProposal = async (
  ownerAcc: any,
  cauldron: Cauldron,
  assets: [string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, assetAddress] of assets) {
    const asset = await ethers.getContractAt('ERC20Mock', assetAddress as string, ownerAcc)
    console.log(`Using ${await asset.name()} at ${assetAddress}`)

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('addAsset', [assetId, assetAddress]),
    })
    console.log(`[Asset: ${bytesToString(assetId)}: ${assetAddress}],`)
  }

  return proposal
}
