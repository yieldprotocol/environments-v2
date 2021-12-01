import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute } from '../../../../shared/helpers'
import { DAI, USDC, WAD } from '../../../../shared/constants'

import { orchestrateSeriesProposal } from '../../../fragments/assetsAndSeries/orchestrateSeriesProposal'
import { initPoolsProposal } from '../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../fragments/core/strategies/initStrategiesProposal'
import { Cauldron, Ladle, Timelock, EmergencyBrake, ERC20Mock } from '../../../../typechain'
import { developer, seriesDAI, seriesUSDC, strategiesData, poolsInit, strategiesInit } from './newEnvironment.config'


/**
 * @dev This script orchestrates and initializes series and strategies
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');
  const deployedStrategies = readAddressMappingIfExists('strategies.json');

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

  // Remember to put enough DAI and USDC in the Timelock to initialize pools and strategies

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateSeriesProposal(ownerAcc, cauldron, ladle, timelock, cloak, seriesDAI))
  proposal = proposal.concat(await orchestrateSeriesProposal(ownerAcc, cauldron, ladle, timelock, cloak, seriesUSDC))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, ladle, poolsInit))
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, deployedStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, deployedStrategies, ladle, strategiesInit))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
