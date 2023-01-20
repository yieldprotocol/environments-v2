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

import { orchestrateAccumulatorOracle } from '../../../../fragments/oracles/orchestrateAccumulatorOracle'
import { updateAccumulatorSources } from '../../../../fragments/oracles/updateAccumulatorSources'
import { updateChainlinkSources } from '../../../../fragments/oracles/updateChainlinkSources'
import { updateCompositePaths } from '../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../../fragments/oracles/updateCompositeSources'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
// import { makeBase } from '../../../../fragments/assetsAndSeries/makeBase'
// import { updateIlk } from '../../../../fragments/assetsAndSeries/updateIlk'
// import { addIlksToSeries } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
// import { addSeries } from '../../../../fragments/assetsAndSeries/addSeries'
// import { initPools } from '../../../../fragments/pools/initPools'
// import { initStrategies } from '../../../../fragments/strategies/initStrategies'
// import { orchestrateStrategies } from '../../../../fragments/strategies/orchestrateStrategies'
// import { onChainTest } from '../../../../fragments/utils/onChainTest'
// import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { accumulators, chainlinkSources, compositeSources, compositePaths, usdt, newJoins } = require(process.env
  .CONF as string)
// const { bases, newChainlinkLimits, auctionLimits, assetsToAdd, newCompositeLimits, newJoins } = require(process.env.CONF as string)

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

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Oracles
  proposal = proposal.concat(await orchestrateAccumulatorOracle(deployer, accumulatorOracle, timelock, cloak))
  proposal = proposal.concat(await updateAccumulatorSources(accumulatorOracle, accumulators))
  proposal = proposal.concat(await updateChainlinkSources(chainlinkOracle, chainlinkSources))
  proposal = proposal.concat(await updateCompositeSources(compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePaths(compositeOracle, compositePaths))

  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, usdt, newJoins))

  //  // Bases and Ilks
  //  proposal = proposal.concat(
  //    await makeBase(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, witch, cloak, bases)
  //  )
  //
  //  proposal = proposal.concat(
  //    await makeIlk(
  //      ownerAcc,
  //      chainlinkOracle as unknown as IOracle,
  //      cauldron,
  //      witch,
  //      cloak,
  //      newJoins(),
  //      newChainlinkLimits,
  //      auctionLimits
  //    )
  //  )
  //
  //  proposal = proposal.concat(
  //    await makeIlk(
  //      ownerAcc,
  //      compositeOracle as unknown as IOracle,
  //      cauldron,
  //      witch,
  //      cloak,
  //      newJoins(),
  //      newCompositeLimits,
  //      auctionLimits
  //    )
  //  )
  //
  //  proposal = proposal.concat(
  //    await updateIlk(chainlinkOracle as unknown as IOracle, cauldron, newChainlinkLimits)
  //  )
  //  proposal = proposal.concat(
  //    await updateIlk(compositeOracle as unknown as IOracle, cauldron, newCompositeLimits)
  //  )
  //
  //  // Series
  //  proposal = proposal.concat(
  //    await addSeries(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newJoins(), newFYTokens(), newPools())
  //  )
  //  proposal = proposal.concat(await addIlksToSeries(cauldron, seriesIlks))
  //  proposal = proposal.concat(await initPools(ownerAcc, timelock, newPools(), poolsInit))
  //
  //  // Strategies
  //  proposal = proposal.concat(await orchestrateStrategies(ownerAcc, newStrategies(), timelock, strategiesData))
  //  proposal = proposal.concat(await initStrategies(ownerAcc, newStrategies(), ladle, timelock, strategiesInit))
  // proposal = proposal.concat(await onChainTest(cauldron, onChainTest, assetsAndJoins))
  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, governance.get('multisig') as string)
  }
})()
