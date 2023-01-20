import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose, stringToBytes6 } from '../../../../../shared/helpers'

import { IOracle } from '../../../../../typechain'
import {
  Timelock__factory,
  EmergencyBrake__factory,
  ChainlinkMultiOracle__factory,
  CompositeMultiOracle__factory,
  AccumulatorMultiOracle__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
} from '../../../../../typechain'

import {
  TIMELOCK,
  CLOAK,
  CAULDRON,
  WITCH,
  LADLE,
  COMPOSITE,
  CHAINLINK,
  ACCUMULATOR,
} from '../../../../../shared/constants'

import { orchestrateAccumulatorOracle } from '../../../../fragments/oracles/orchestrateAccumulatorOracle'
import { updateAccumulatorSources } from '../../../../fragments/oracles/updateAccumulatorSources'
import { updateChainlinkSources } from '../../../../fragments/oracles/updateChainlinkSources'
import { updateCompositePaths } from '../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../../fragments/oracles/updateCompositeSources'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
import { makeBase } from '../../../../fragments/assetsAndSeries/makeBase'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
// import { updateIlk } from '../../../../fragments/assetsAndSeries/updateIlk'
// import { addIlksToSeries } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
// import { addSeries } from '../../../../fragments/assetsAndSeries/addSeries'
// import { initPools } from '../../../../fragments/pools/initPools'
// import { initStrategies } from '../../../../fragments/strategies/initStrategies'
// import { orchestrateStrategies } from '../../../../fragments/strategies/orchestrateStrategies'
// import { onChainTest } from '../../../../fragments/utils/onChainTest'
const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol, joins } = require(process.env.CONF as string)
const { accumulators, chainlinkSources, compositeSources, compositePaths, usdt, ilks } = require(process.env
  .CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const chainlinkOracle = ChainlinkMultiOracle__factory.connect(protocol().getOrThrow(CHAINLINK)!, ownerAcc)
  const compositeOracle = CompositeMultiOracle__factory.connect(protocol().getOrThrow(COMPOSITE)!, ownerAcc)
  const accumulatorOracle = AccumulatorMultiOracle__factory.connect(protocol().getOrThrow(ACCUMULATOR)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().getOrThrow(WITCH)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Oracles
  proposal = proposal.concat(await orchestrateAccumulatorOracle(deployer, accumulatorOracle, timelock, cloak))
  proposal = proposal.concat(await updateAccumulatorSources(accumulatorOracle, accumulators))
  proposal = proposal.concat(await updateChainlinkSources(chainlinkOracle, chainlinkSources))
  proposal = proposal.concat(await updateCompositeSources(compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePaths(compositeOracle, compositePaths))

  // Add Asset
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, usdt.asset, joins))

  // Add Underlying
  proposal = proposal.concat(
    await makeBase(ownerAcc, cloak, accumulatorOracle as unknown as IOracle, cauldron, witch, usdt, joins)
  )

  // Add Ilks
  for (let ilk of ilks) {
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins))
  }

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
