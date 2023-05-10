import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  AccessControl__factory,
  FYToken__factory,
  Pool__factory,
  Strategy__factory,
  PoolRestorer__factory,
  AccumulatorMultiOracle__factory,
} from '../../../../typechain'

import { id } from '../../../../shared/helpers'

import { Permission } from '../../../governance/confTypes'

import { ZERO, RATE } from '../../../../shared/constants'
import { MULTISIG, TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH, POOL_RESTORER, ACCUMULATOR } from '../../../../shared/constants'

import { addSeries } from '../../../fragments/assetsAndSeries/addSeries'
import { orchestrateFYToken } from '../../../fragments/assetsAndSeries/orchestrateFYToken'
import { orchestratePool } from '../../../fragments/pools/orchestratePool'
import { orchestrateStrategy } from '../../../fragments/strategies/orchestrateStrategy'
import { updateAccumulatorPerSecondRate } from '../../../fragments/oracles/updateAccumulatorPerSecondRate'
import { investStrategy } from '../../../fragments/strategies/investStrategy'
import { initStrategy } from '../../../fragments/strategies/initStrategy'
import { orchestratePoolRestorer } from '../../../fragments/emergency/orchestratePoolRestorer'
import { isolatePoolRestorer } from '../../../fragments/emergency/isolatePoolRestorer'
import { restorePool } from '../../../fragments/emergency/restorePool'
import { grantPermission } from '../../../fragments/permissions/grantPermission'
import { revokePermission } from '../../../fragments/permissions/revokePermission'
import { sendTokens } from '../../../fragments/utils/sendTokens'
import { mintPool } from '../../../fragments/emergency/mintPool'
import { mintStrategy } from '../../../fragments/emergency/mintStrategy'
import { BigNumber } from 'ethers'

const { developer, deployers, governance, protocol, fyTokens, pools, newSeries, newStrategies, poolRestorations, transfers, mints } = require(process.env
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

  // Update the per second rate on accumulators
  const accumulator = AccumulatorMultiOracle__factory.connect(protocol.getOrThrow(ACCUMULATOR)!, ownerAcc)
  for (let series of newSeries) {
    proposal = proposal.concat(await updateAccumulatorPerSecondRate(accumulator, {
      baseId: series.base.assetId,
      kind: RATE,
      startRate: ZERO, // Ignored
      perSecondRate: BigNumber.from('1000000001546067000') // 5%
    }))
  } 
  
  // Add September 2023 series
  for (let series of newSeries) {
    proposal = proposal.concat(await addSeries(ownerAcc, cauldron, ladle, witch, cloak, series, pools))
  }

  // Init new strategies
  for (let strategy of newStrategies) {
    proposal = proposal.concat(await initStrategy(ownerAcc, strategy))
  }

  // Invest new strategies

  for (let strategy of newStrategies) {
    proposal = proposal.concat(await investStrategy(ownerAcc, strategy))
  }

  // Transfer the base to the pools
  for (let transfer of transfers) {
    proposal = proposal.concat(await sendTokens(timelock, transfer))
  }
  
  // Use the base to mint the first batch of pool tokens
  for (let mint of mints) {
    const pool = Pool__factory.connect(pools.getOrThrow(mint.seriesId)!, ownerAcc)
    const strategy = Strategy__factory.connect(mint.receiver, ownerAcc)
    proposal = proposal.concat(await mintPool(pool, strategy.address, timelock.address))
    proposal = proposal.concat(await mintStrategy(strategy, timelock.address))
  }
  
    // Orchestrate the poolRestorer
    const poolRestorer = PoolRestorer__factory.connect(protocol.getOrThrow(POOL_RESTORER)!, ownerAcc)
    proposal = proposal.concat(
      await orchestratePoolRestorer(deployers.getOrThrow(poolRestorer.address), timelock, poolRestorer)
    )

  // Restore pools to their ratio and value:
  // - A flash loan from the join to mint pool tokens restores the value
  // - A mint of fyToken that buys the underlying back restores the ratio
  // Then, use the pool tokens from both batches to mint strategy tokens
  for (let poolRestoration of poolRestorations) {
    const fyToken = FYToken__factory.connect(fyTokens.getOrThrow(poolRestoration.seriesId)!, ownerAcc)
    const strategy = Strategy__factory.connect(poolRestoration.receiver, ownerAcc)
    const mintFYTokenPermission: Permission = {functionName: id(fyToken.interface, 'mint(address,uint256)'), host: fyToken.address, user: poolRestorer.address}
    proposal = proposal.concat(await grantPermission(mintFYTokenPermission))
    proposal = proposal.concat(await restorePool(poolRestorer, poolRestoration))
    proposal = proposal.concat(await mintStrategy(strategy, timelock.address))
    proposal = proposal.concat(await revokePermission(mintFYTokenPermission))
  }

  // Isolate the poolRestorer
  proposal = proposal.concat(await isolatePoolRestorer(timelock, poolRestorer))


  await propose(timelock, proposal, developer)
})()
