import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose, stringToBytes6 } from '../../../../../shared/helpers'

import {
  IOracle,
  ChainlinkMultiOracle,
  CompositeMultiOracle,
  UniswapV3Oracle,
  AccumulatorMultiOracle,
  OnChainTest,
} from '../../../../../typechain'
import { Cauldron, Ladle, OldWitch, Timelock, EmergencyBrake } from '../../../../../typechain'

import { COMPOSITE, CHAINLINK, UNISWAP, ACCUMULATOR } from '../../../../../shared/constants'

import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSources'
import { makeBaseProposal } from '../../../../fragments/assetsAndSeries/makeBase'
import { updateIlkProposal } from '../../../../fragments/assetsAndSeries/updateIlk'
import { updateAccumulatorSourcesProposal } from '../../../../fragments/oracles/updateAccumulatorSources'
import { orchestrateAccumulatorOracleProposal } from '../../../../fragments/oracles/orchestrateAccumulatorOracle'
import { orchestrateJoinProposal } from '../../../../fragments/core/removeDeployerRootToCloak'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAsset'
import { updateChainlinkSourcesProposal } from '../../../../fragments/oracles/updateChainlinkSources'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeries'
import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeries'
import { initPoolsProposal } from '../../../../fragments/pools/initPools'
import { initStrategiesProposal } from '../../../../fragments/strategies/initStrategies'
import { orchestrateStrategiesProposal } from '../../../../fragments/strategies/orchestrateStrategies'
import { onChainTestProposal } from '../../../../fragments/utils/onChainTest'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlk'
const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const {
  newCompositePaths,
  rateChiSources,
  compositeSources,
  newFYTokens,
  newPools,
  seriesIlks,
  poolsInit,
  newStrategies,
  strategiesData,
  strategiesInit,
} = require(process.env.CONF as string)
const { bases, newChainlinkLimits, auctionLimits, assetsToAdd, newCompositeLimits, newJoins } = require(process.env
  .CONF as string)
const { chainlinkSources } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const chainlinkOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol().getOrThrow(CHAINLINK) as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol().getOrThrow(COMPOSITE) as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const uniswapOracle = (await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol().getOrThrow(UNISWAP) as string,
    ownerAcc
  )) as unknown as UniswapV3Oracle
  const accumulatorOracle = (await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol().getOrThrow(ACCUMULATOR) as string,
    ownerAcc
  )) as unknown as AccumulatorMultiOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol().getOrThrow('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol().getOrThrow('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const witch = (await ethers.getContractAt(
    'OldWitch',
    protocol().getOrThrow('witch') as string,
    ownerAcc
  )) as unknown as OldWitch
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

  let assetsAndJoins: [string, string, string][] = []

  for (let [assetId, joinAddress] of newJoins()) {
    assetsAndJoins.push([assetId, assetsToAdd.get(assetId) as string, joinAddress])
  }

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Oracles
  proposal = proposal.concat(await orchestrateAccumulatorOracleProposal(deployer, accumulatorOracle, timelock, cloak))
  proposal = proposal.concat(await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources))
  proposal = proposal.concat(await updateCompositeSourcesProposal(ownerAcc, compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))

  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  // Bases and Ilks
  proposal = proposal.concat(
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, witch, cloak, bases)
  )

  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      chainlinkOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins(),
      newChainlinkLimits,
      auctionLimits
    )
  )

  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      compositeOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins(),
      newCompositeLimits,
      auctionLimits
    )
  )

  proposal = proposal.concat(
    await updateIlkProposal(chainlinkOracle as unknown as IOracle, cauldron, newChainlinkLimits)
  )
  proposal = proposal.concat(
    await updateIlkProposal(compositeOracle as unknown as IOracle, cauldron, newCompositeLimits)
  )

  // Series
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newJoins(), newFYTokens(), newPools())
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools(), poolsInit))

  // Strategies
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies(), timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies(), ladle, timelock, strategiesInit))
  // proposal = proposal.concat(await onChainTestProposal(cauldron, onChainTest, assetsAndJoins))
  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, governance.get('multisig') as string)
  }
})()