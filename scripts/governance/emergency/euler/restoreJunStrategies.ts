import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  FYToken__factory,
  Pool__factory,
  Strategy__factory,
} from '../../../../typechain'

import { MULTISIG, TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH } from '../../../../shared/constants'

import { addSeries } from '../../../fragments/assetsAndSeries/addSeries'
import { orchestrateFYToken } from '../../../fragments/assetsAndSeries/orchestrateFYToken'
import { orchestratePool } from '../../../fragments/pools/orchestratePool'
import { orchestrateStrategy } from '../../../fragments/strategies/orchestrateStrategy'
import { investStrategy } from '../../../fragments/strategies/investStrategy'
import { initStrategy } from '../../../fragments/strategies/initStrategy'
import { mintFYToken } from '../../../fragments/emergency/mintFYToken'
import { sellFYToken } from '../../../fragments/emergency/sellFYToken'
import { sendTokens } from '../../../fragments/utils/sendTokens'
import { mintPool } from '../../../fragments/emergency/mintPool'
import { mintStrategy } from '../../../fragments/emergency/mintStrategy'

const { developer, deployers, governance, protocol, newSeries, fyTokens, pools, newStrategies, trades, transfers, mints } = require(process.env
  .CONF as string)

/**
 * @dev This script orchestrates a new series and related strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol.getOrThrow(WITCH)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Orchestrate new series contracts
  for (let series of newSeries) {
    proposal = proposal.concat(
      await orchestrateFYToken(
        deployers.getOrThrow(series.fyToken.address),
        timelock,
        cloak,
        FYToken__factory.connect(series.fyToken.address, ownerAcc)
      )
    )
    proposal = proposal.concat(
      await orchestratePool(
        deployers.getOrThrow(series.pool.address),
        timelock,
        Pool__factory.connect(series.pool.address, ownerAcc)
      )
    )
  }

  // Orchestrate new strategies
  for (let strategy of newStrategies) {
    proposal = proposal.concat(
      await orchestrateStrategy(
        deployers.getOrThrow(strategy.address),
        governance.getOrThrow(MULTISIG)!,
        timelock,
        ladle,
        strategy,
        pools
      )
    )
  }

  // Add June 2023 series
  for (let series of newSeries) {
    proposal = proposal.concat(await addSeries(ownerAcc, cauldron, ladle, witch, cloak, series, pools))
  }

  // Init new strategies
  for (let strategy of newStrategies) {
    proposal = proposal.concat(await initStrategy(ownerAcc, strategy))
  }
  
  // If it reverts, try executing the the proposal above this line first, and below this line second. I think Tenderly struggles with this much data.

  // Invest new strategies

  for (let strategy of newStrategies) {
    proposal = proposal.concat(await investStrategy(ownerAcc, strategy))
  }

  // Return to previous ratio
  for (let trade of trades) {
    const fyToken = FYToken__factory.connect(fyTokens.getOrThrow(trade.seriesId)!, ownerAcc)
    proposal = proposal.concat(await mintFYToken(timelock, fyToken, pools.getOrThrow(trade.seriesId)!, trade.amount))

    const pool = Pool__factory.connect(pools.getOrThrow(trade.seriesId)!, ownerAcc)
    proposal = proposal.concat(await sellFYToken(pool, timelock.address, trade.minReceived))
  }

  // Transfer the base to the pools, including the euler bonus
  for (let transfer of transfers) {
    proposal = proposal.concat(await sendTokens(timelock, transfer))
  }

  // Mint fyToken, pool and strategy tokens
  for (let mint of mints) {
    const fyToken = FYToken__factory.connect(fyTokens.getOrThrow(mint.seriesId)!, ownerAcc)
    const pool = Pool__factory.connect(pools.getOrThrow(mint.seriesId)!, ownerAcc)
    const strategy = Strategy__factory.connect(mint.receiver, ownerAcc)
    proposal = proposal.concat(await mintFYToken(timelock, fyToken, pools.getOrThrow(mint.seriesId)!, mint.amount))
    proposal = proposal.concat(await mintPool(pool, strategy.address, timelock.address))
    proposal = proposal.concat(await mintStrategy(strategy, timelock.address))
  }

  await propose(timelock, proposal, developer)
})()
