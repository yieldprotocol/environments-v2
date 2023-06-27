import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  FYToken__factory,
  Pool__factory,
} from '../../../../typechain'

import { MULTISIG, TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH } from '../../../../shared/constants'

import { addSeries } from '../../../fragments/assetsAndSeries/addSeries'
import { orchestrateFYToken } from '../../../fragments/assetsAndSeries/orchestrateFYToken'
import { orchestratePool } from '../../../fragments/pools/orchestratePool'
import { orchestrateStrategy } from '../../../fragments/strategies/orchestrateStrategy'
import { investStrategy } from '../../../fragments/strategies/investStrategy'
import { migrateStrategy } from '../../../fragments/strategies/migrateStrategy'
import { migrateUSDCStrategy } from './migrateMarUSDCStrategy'

const { developer, deployers, governance, protocol, newSeries, pools, oldStrategies, newStrategies } = require(process
  .env.CONF as string)

/**
 * @dev This script orchestrates a new series and rolls liquidity in the related strategies
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

  // Add September 2023 series
  for (let series of newSeries) {
    proposal = proposal.concat(await addSeries(ownerAcc, cauldron, ladle, witch, cloak, series, pools))
  }

  // Migrate funds from old strategies to new ones
  for (let strategy of oldStrategies) {
    proposal = proposal.concat(await migrateStrategy(ownerAcc, strategy))
  }

  // Invest new strategies
  for (let strategy of newStrategies) {
    proposal = proposal.concat(await investStrategy(ownerAcc, strategy))
  }

  proposal = proposal.concat(await migrateUSDCStrategy(timelock, ladle, ownerAcc))

  await propose(timelock, proposal, developer)
})()
