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
  FlashJoin__factory,
  FYToken__factory,
  Pool__factory,
  Strategy__factory,
} from '../../../../../typechain'

import {
  MULTISIG,
  TIMELOCK,
  CLOAK,
  CAULDRON,
  WITCH,
  LADLE,
  COMPOSITE,
  CHAINLINK,
  ACCUMULATOR,
} from '../../../../../shared/constants'

import { updateAccumulatorSources } from '../../../../fragments/oracles/updateAccumulatorSources'
import { updateChainlinkSources } from '../../../../fragments/oracles/updateChainlinkSources'
import { updateCompositePaths } from '../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../../fragments/oracles/updateCompositeSources'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
import { makeBase } from '../../../../fragments/assetsAndSeries/makeBase'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
import { addSeries } from '../../../../fragments/assetsAndSeries/addSeries'
import { orchestrateFlashJoin } from '../../../../fragments/assetsAndSeries/orchestrateFlashJoin'
import { orchestrateFYToken } from '../../../../fragments/assetsAndSeries/orchestrateFYToken'
import { orchestratePool } from '../../../../fragments/pools/orchestratePool'
import { orchestrateStrategy } from '../../../../fragments/strategies/orchestrateStrategy'
// import { initPools } from '../../../../fragments/pools/initPools'
// import { initStrategies } from '../../../../fragments/strategies/initStrategies'
// import { onChainTest } from '../../../../fragments/utils/onChainTest'
const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol, joins, fyTokens, pools, strategies, newStrategies } = require(process.env.CONF as string)
const { accumulators, chainlinkSources, compositeSources, compositePaths, usdt, ilks, series } = require(process.env
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

  // Orchestrate new contracts
  proposal = proposal.concat(
    await orchestrateFlashJoin(
      timelock,
      cloak,
      FlashJoin__factory.connect(joins.getOrThrow(usdt.asset.assetId)!, ownerAcc)
    )
  )
  for (let oneSeries of series) {
    proposal = proposal.concat(
      await orchestrateFYToken(timelock, cloak, FYToken__factory.connect(oneSeries.fyToken.address, ownerAcc))
    )
    proposal = proposal.concat(await orchestratePool(timelock, Pool__factory.connect(oneSeries.pool.address, ownerAcc)))
  }
  for (let strategy of newStrategies) {
    proposal = proposal.concat(
      await orchestrateStrategy(
        governance.getOrThrow(MULTISIG)!,
        timelock,
        ladle,
        Strategy__factory.connect(strategies.getOrThrow(strategy)!, ownerAcc)
      )
    )
  }

  // Oracles
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

  // Series
  // for (let oneSeries of series) {
  //   proposal = proposal.concat(await addSeries(ownerAcc, cauldron, ladle, witch, cloak, oneSeries, pools))
  //   proposal = proposal.concat(await initPools(ownerAcc, timelock, newPools(), poolsInit))
  // }
  //
  //
  //  // Strategies
  //  proposal = proposal.concat(await initStrategies(ownerAcc, newStrategies(), ladle, timelock, strategiesInit))
  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, governance.get('multisig') as string)
  }
})()
