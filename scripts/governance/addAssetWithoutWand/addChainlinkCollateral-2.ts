import { ethers } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import { orchestrateJoinProposal } from '../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateChainlinkSourcesProposal } from '../../fragments/oracles/updateChainlinkSourcesProposal'
import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import { IOracle, ChainlinkMultiOracle, Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../typechain'

import { developer, deployer, chainlinkSources, assetsToAdd, debtLimits, auctionLimits, seriesIlks } from './addMKR.rinkeby.config'

/**
 * @dev This script configures the Yield Protocol to use a collateral with a Chainlink oracle vs. ETH.
 * Previously, the collateral should have been added as an asset with the Wand.
 * Add collateral as an asset
 * --- You are here ---
 * Add the collateral/ETH source to the Chainlink Oracle
 * Permission the collateral Join
 * Make collateral into an Ilk
 * Approve collateral as collateral for all series
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json');
  const joins = readAddressMappingIfExists('joins.json');
  const governance = readAddressMappingIfExists('governance.json');

  const chainlinkOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd))
  proposal = proposal.concat(await makeIlkProposal(
    ownerAcc,
    chainlinkOracle as unknown as IOracle,
    cauldron,
    witch,
    cloak,
    joins,
    debtLimits,
    auctionLimits
  ))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
