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
import { getOwnerOrImpersonate, proposeApproveExecute, mapToJson, jsonToMap } from '../../shared/helpers'

import { Wand, Timelock } from '../../typechain'
import { addAssetProposal } from './addAssetProposal'
import { newAssets } from './addAsset.config'


;(async () => {
  const developerIfImpersonating = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

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
