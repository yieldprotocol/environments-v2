import { ethers } from 'hardhat'
import {
  getOwnerOrImpersonate,
  proposeApproveExecute,
  readAddressMappingIfExists,
} from '../../../../../../shared/helpers'

import { IOracle, ChainlinkUSDMultiOracle, AccumulatorMultiOracle } from '../../../../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../../../../typechain'

import { CHAINLINKUSD, ACCUMULATOR } from '../../../../../../shared/constants'

import { updateAccumulatorSourcesProposal } from '../../../../../fragments/oracles/updateAccumulatorSources'
import { updateChainlinkUSDSourcesProposal } from '../../../../../fragments/oracles/updateChainlinkUSDSources'
import { makeBaseProposal } from '../../../../../fragments/assetsAndSeries/makeBase'
import { updateIlkProposal } from '../../../../../fragments/assetsAndSeries/updateIlk'
import { addSeriesProposal } from '../../../../../fragments/assetsAndSeries/addSeries'
import { addIlksToSeriesProposal } from '../../../../../fragments/assetsAndSeries/addIlkToSeries'
import { initPoolsProposal } from '../../../../../fragments/pools/initPools'
import { orchestrateStrategiesProposal } from '../../../../../fragments/strategies/orchestrateStrategies'
import { initStrategiesProposal } from '../../../../../fragments/strategies/initStrategies'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { chainlinkUSDSources, rateChiSources } = require(process.env.CONF as string)
const { bases, chainlinkDebtLimits } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools, joins } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const chainlinkUSDOracle = (await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get(CHAINLINKUSD) as string,
    ownerAcc
  )) as unknown as ChainlinkUSDMultiOracle
  const accumulatorOracle = (await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )) as unknown as AccumulatorMultiOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
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

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  // Oracles
  proposal = proposal.concat(await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources))
  // proposal = proposal.concat(await updateChainlinkUSDSourcesProposal(chainlinkUSDOracle, chainlinkUSDSources))

  // Bases and Ilks
  proposal = proposal.concat(
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, ladle, witch, cloak, bases)
  )

  proposal = proposal.concat(
    await updateIlkProposal(chainlinkUSDOracle as unknown as IOracle, cauldron, chainlinkDebtLimits)
  )

  // Series
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newFYTokens, newPools, joins)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  // Strategies
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
})()
