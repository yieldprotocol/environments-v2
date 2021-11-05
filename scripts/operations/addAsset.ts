/**
 * @dev This script adds one or more assets to the protocol.
 *
 * It takes as inputs the governance, protocol, assets and joins json address files.
 * It uses the Wand to:
 *  - Add the asset to Cauldron.
 *  - Deploy a new Join, which gets added to the Ladle, which gets permissions to join and exit.
 * The Timelock and Cloak get ROOT access to the new Join. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new Join.
 * A plan is recorded in the Cloak to isolate the Join from the Ladle.
 * It adds to the assets and joins json address files.
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { bytesToString, getOwnerOrImpersonate, proposeApproveExecute, mapToJson, jsonToMap } from '../../shared/helpers'

import { Wand, Timelock, ERC20Mock } from '../../typechain'

import { newAssets } from './addAsset.config'

export const addAssetProposal = async (
  ownerAcc: any, 
  wand: Wand,
  assets: [string, string][]
): Promise<Array<{ target: string; data: string }>>  => {
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, assetAddress] of assets) {
    const asset = (await ethers.getContractAt('ERC20Mock', assetAddress as string, ownerAcc)) as unknown as ERC20Mock
    console.log(`Using ${await asset.name()} at ${assetAddress}`)

    proposal.push({
      target: wand.address,
      data: wand.interface.encodeFunctionData('addAsset', [assetId, assetAddress]),
    })
    console.log(`[Asset: ${bytesToString(assetId)}: ${assetAddress}],`)
  }

  return proposal
}


;(async () => {
  const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown as Wand
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const proposal = await addAssetProposal(ownerAcc, wand, newAssets)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)

  for (let [assetId, assetAddress] of newAssets) {
    assets.set(assetId, assetAddress)
  }

  fs.writeFileSync('./addresses/assets.json', mapToJson(assets), 'utf8')
})()
