import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute, readAddressMappingIfExists } from '../../../../shared/helpers'

import {
  IOracle,
  ChainlinkMultiOracle,
  CompositeMultiOracle,
  UniswapV3Oracle,
  CompoundMultiOracle,
} from '../../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../../typechain'

import { COMPOUND, COMPOSITE, CHAINLINK, UNISWAP } from '../../../../shared/constants'

import { updateChiSourcesProposal } from '../../../fragments/oracles/updateChiSourcesProposal'
import { updateRateSourcesProposal } from '../../../fragments/oracles/updateRateSourcesProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBaseProposal'
import { updateIlkProposal } from '../../../fragments/assetsAndSeries/updateIlkProposal'
import { addSeriesProposal } from '../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { initPoolsProposal } from '../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../fragments/core/strategies/initStrategiesProposal'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { newCompositePaths, newRateSources, newChiSources } = require(process.env.CONF as string)
const { bases, newChainlinkLimits, newUniswapLimits, newCompositeLimits } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const chainlinkOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get(CHAINLINK) as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const uniswapOracle = (await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get(UNISWAP) as string,
    ownerAcc
  )) as unknown as UniswapV3Oracle
  const compoundOracle = (await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get(COMPOUND) as string,
    ownerAcc
  )) as unknown as CompoundMultiOracle
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
  proposal = proposal.concat(await updateChiSourcesProposal(compoundOracle, newChiSources))
  proposal = proposal.concat(await updateRateSourcesProposal(compoundOracle, newRateSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))

  // Bases and Ilks
  proposal = proposal.concat(
    await makeBaseProposal(ownerAcc, compoundOracle as unknown as IOracle, cauldron, ladle, witch, cloak, bases)
  )
  proposal = proposal.concat(
    await updateIlkProposal(chainlinkOracle as unknown as IOracle, cauldron, newChainlinkLimits)
  )
  proposal = proposal.concat(
    await updateIlkProposal(chainlinkOracle as unknown as IOracle, cauldron, newUniswapLimits)
  )
  proposal = proposal.concat(
    await updateIlkProposal(compositeOracle as unknown as IOracle, cauldron, newCompositeLimits)
  )

  // Series
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newFYTokens, newPools)
  )
  proposal = proposal.concat(
    await addIlksToSeriesProposal(cauldron, seriesIlks)
  )
  proposal = proposal.concat(
    await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit)
  )
 
  // Strategies
  proposal = proposal.concat(
    await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData)
  )
  proposal = proposal.concat(
    await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit)
  )

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
  }
})()
