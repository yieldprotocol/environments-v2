import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
  jsonToMap,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
  mapToJson,
} from '../../../../shared/helpers'

import { updateSpotSourcesProposal } from '../../oracles/updateSpotSourcesProposal'
import { orchestrateAddedAssetProposal } from '../../orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../makeIlkProposal'
import { addIlksToSeriesProposal } from '../../addIlksToSeriesProposal'
import { developerIfImpersonating, ilks, seriesIlks, addAssets, assetEthSource } from './addUNICollateral.config'

import { Cauldron, Ladle, Witch, Wand, Timelock, EmergencyBrake } from '../../../../typechain'

/**
 * @dev This script configures the Yield Protocol to use UNI as a collateral.
 * Previously, UNI should have been added as an asset with the Wand.
 * Add UNI as an asset
 * --- You are here ---
 * Add the UNI/ETH source to the Chainlink Oracle
 * Permission the UNIJoin
 * Make UNI into an Ilk
 * Approve UNI as collateral for all series
 */
;(async () => {
  
  let chainId: number
  chainId = await getOriginalChainId()

  // Input data: assetId, asset address
  const addedAssets: Array<[string, string]> = addAssets(chainId)

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  const path = chainId == 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync(path + 'joins.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>

  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron
  const ladle = ((await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown) as Ladle
  const witch = ((await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown) as Witch
  const wand = ((await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown) as Wand
  const cloak = ((await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown) as EmergencyBrake
  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  // Update json database from previous step
  for (let [assetId, assetAddress] of addedAssets) {
    // Make sure the asset is recorded
    assets.set(assetId, assetAddress as string)
    fs.writeFileSync(path + 'assets.json', mapToJson(assets), 'utf8')
    // The joins file can only be updated after the successful execution of the proposal
    joins.set(assetId, (await ladle.joins(assetId)) as string)
    fs.writeFileSync(path + 'joins.json', mapToJson(joins), 'utf8')
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateSpotSourcesProposal(ownerAcc, protocol, assetEthSource(chainId)))
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc, joins, ladle, timelock, cloak, addedAssets))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, protocol, joins, witch, wand, cloak, ilks))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
