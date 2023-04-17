import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import { IOracle } from '../../../../typechain'
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
} from '../../../../typechain'

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
} from '../../../../shared/constants'

import { orchestrateFlashJoin } from '../../../fragments/assetsAndSeries/orchestrateFlashJoin'
import { orchestrateFYToken } from '../../../fragments/assetsAndSeries/orchestrateFYToken'
import { orchestratePool } from '../../../fragments/pools/orchestratePool'
import { orchestrateStrategy } from '../../../fragments/strategies/orchestrateStrategy'
import { updateAccumulatorSources } from '../../../fragments/oracles/updateAccumulatorSources'
import { updateChainlinkSources } from '../../../fragments/oracles/updateChainlinkSources'
import { updateCompositePaths } from '../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../fragments/oracles/updateCompositeSources'
import { addAsset } from '../../../fragments/assetsAndSeries/addAsset'
import { makeBase } from '../../../fragments/assetsAndSeries/makeBase'
import { makeIlk } from '../../../fragments/assetsAndSeries/makeIlk'
import { addSeries } from '../../../fragments/assetsAndSeries/addSeries'
import { initStrategy } from '../../../fragments/strategies/initStrategy'
import { investStrategy } from '../../../fragments/strategies/investStrategy'

const { developer, governance, protocol, deployers, joins, pools } = require(process.env.CONF as string)
const {
  accumulators,
  chainlinkSources,
  compositeSources,
  compositePaths,
  newBase,
  newIlks,
  newSeries,
  newStrategies,
} = require(process.env.CONF as string)

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
  const usdtJoinAddress = joins.getOrThrow(newBase.assetId)!
  proposal = proposal.concat(
    await orchestrateFlashJoin(
      deployers.getOrThrow(usdtJoinAddress)!,
      timelock,
      cloak,
      FlashJoin__factory.connect(usdtJoinAddress, ownerAcc)
    )
  )
  for (let series of newSeries) {
    proposal = proposal.concat(
      await orchestrateFYToken(
        deployers.getOrThrow(series.fyToken.address)!,
        timelock,
        cloak,
        FYToken__factory.connect(series.fyToken.address, ownerAcc)
      )
    )
    proposal = proposal.concat(
      await orchestratePool(
        deployers.getOrThrow(series.pool.address)!,
        timelock,
        Pool__factory.connect(series.pool.address, ownerAcc)
      )
    )
  }
  for (let strategy of newStrategies) {
    proposal = proposal.concat(
      await orchestrateStrategy(
        deployers.getOrThrow(strategy.address)!,
        governance.getOrThrow(MULTISIG)!,
        timelock,
        ladle,
        strategy
      )
    )
  }

  // Oracles
  proposal = proposal.concat(await updateAccumulatorSources(accumulatorOracle, accumulators))
  proposal = proposal.concat(await updateChainlinkSources(chainlinkOracle, chainlinkSources))
  if (compositeSources !== undefined)
    proposal = proposal.concat(await updateCompositeSources(compositeOracle, compositeSources))
  if (compositePaths !== undefined)
    proposal = proposal.concat(await updateCompositePaths(compositeOracle, compositePaths))

  // Add Asset
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, newBase, joins))

  // Add Underlying
  proposal = proposal.concat(await makeBase(ownerAcc, cloak, cauldron, witch, newBase, joins))

  // Add Ilks
  for (let ilk of newIlks) {
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins))
  }

  // Series
  for (let series of newSeries) {
    proposal = proposal.concat(await addSeries(ownerAcc, cauldron, ladle, witch, cloak, series, pools))
  }

  // Strategies
  for (let strategy of newStrategies) {
    proposal = proposal.concat(await initStrategy(ownerAcc, strategy))
    proposal = proposal.concat(await investStrategy(ownerAcc, strategy)) // This inits the pools as well
  }

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, governance.get('multisig') as string)
  }
})()
