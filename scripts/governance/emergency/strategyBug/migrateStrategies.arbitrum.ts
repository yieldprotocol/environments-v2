import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  Ladle__factory,
  Pool__factory,
} from '../../../../typechain'

import { MULTISIG,TIMELOCK, LADLE } from '../../../../shared/constants'

import { orchestratePool } from '../../../fragments/pools/orchestratePool'
import { addPool } from '../../../fragments/ladle/addPool'
import { orchestrateStrategy } from '../../../fragments/strategies/orchestrateStrategy'
import { investStrategy } from '../../../fragments/strategies/investStrategy'


const { developer, deployers, governance, protocol, newSeries, oldStrategies, newStrategies } = require(process.env
  .CONF as string)

/**
 * @dev This script orchestrates a new series and rolls liquidity in the related strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow(LADLE)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  for (let series of newSeries) {
    // Orchestrate new contracts
    proposal = proposal.concat(
      await orchestratePool(
        deployers.getOrThrow(series.pool.address),
        timelock,
        Pool__factory.connect(series.pool.address, ownerAcc)
      )
    )

    proposal = proposal.concat(await addPool(ladle, series.seriesId, series.pool.address))
  }

  // The old strategies are already divested
  // Investing the old strategies transfers the liquidity to the new ones
  for (let oldStrategy of oldStrategies) {
    // Use the v1 to v2 migration process
    proposal = proposal.concat(await investStrategy(ownerAcc, oldStrategy))
  }


  // The new strategies are now orchestrated and invested in the new pools
  for (let newStrategy of newStrategies) {
    proposal = proposal.concat(
      await orchestrateStrategy(
        deployers.getOrThrow(newStrategy.address),
        governance.getOrThrow(MULTISIG)!,
        timelock,
        ladle,
        newStrategy,
      )
    )
    proposal = proposal.concat(
      await investStrategy(ownerAcc, newStrategy)
    )
  }

  await propose(timelock, proposal, developer)
})()
