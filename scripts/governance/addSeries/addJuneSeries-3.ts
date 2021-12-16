import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute } from '../../../shared/helpers'

import { addSeriesProposal } from '../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { initPoolsProposal } from '../../fragments/assetsAndSeries/initPoolsProposal'
import { rollStrategiesProposal } from '../../fragments/core/strategies/rollStrategiesProposal'
import { Cauldron, Ladle, EmergencyBrake, Timelock } from '../../../typechain'
import { developer, deployer, seriesIlks, poolsInit, rollData } from './addJuneSeries.rinkeby.config'

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');
  const strategies = readAddressMappingIfExists('strategies.json');

  // Temporary files with the fyTokens and pools to add
  const newFYTokens = readAddressMappingIfExists('newFYTokens.json');
  const newPools = readAddressMappingIfExists('newPools.json');

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
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newFYTokens, newPools))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, newPools, poolsInit))
  proposal = proposal.concat(await rollStrategiesProposal(ownerAcc, strategies, newPools, rollData))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
