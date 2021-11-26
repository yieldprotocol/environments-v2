import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'

import { updateChainlinkSourcesProposal } from '../../fragments/oracles/updateChainlinkSourcesProposal'
import { orchestrateAddedAssetProposal } from '../../fragments/assetsAndSeries/orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { developerIfImpersonating, ilks, seriesIlks, addAssets, assetEthSource } from './addUNICollateral.config'

import { IOracle, ChainlinkMultiOracle, Cauldron, Ladle, Witch, Wand, Timelock, EmergencyBrake } from '../../../typechain'

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
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  // Input data: assetId, asset address
  const addedAssets: Array<[string, string]> = addAssets(chainId)


  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron
  const chainlinkOracle = ((await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc)) as unknown) as ChainlinkMultiOracle
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

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, assetEthSource(chainId)))
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc, ladle, timelock, cloak, addedAssets))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, chainlinkOracle as unknown as IOracle, ladle, witch, wand, cloak, ilks))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
