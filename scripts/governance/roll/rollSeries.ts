import { getOwnerOrImpersonate, propose } from '../../../shared/helpers'

import {
  Timelock__factory,
  EmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  FYToken__factory,
  Pool__factory,
  Trader__factory,
} from '../../../typechain'

import { TIMELOCK, CLOAK, CAULDRON, LADLE, WITCH, TRADER_DXDY } from '../../../shared/constants'

import { addSeries } from '../../fragments/assetsAndSeries/addSeries'
import { orchestrateFYToken } from '../../fragments/assetsAndSeries/orchestrateFYToken'
import { orchestratePool } from '../../fragments/pools/orchestratePool'
import { rollStrategy } from '../../fragments/strategies/rollStrategy'
import { sendTokens } from '../../fragments/utils/sendTokens'
import { sellFYTokens } from '../../fragments/utils/sellFYTokens'

const { chainId, developer, deployers, governance, protocol, pools, newSeries, rollStrategies, traderFunding, fyTokenSelling } = require(process.env
  .CONF as string)

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

  for (let series of newSeries) {
    // Orchestrate new contracts
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

    // Add series
    proposal = proposal.concat(await addSeries(ownerAcc, cauldron, ladle, witch, cloak, series, pools))
  }
  
  for (let strategy of rollStrategies) {
    proposal = proposal.concat(await rollStrategy(ownerAcc, strategy))
  }
  
//  if (chainId === 1) {
//    const trader = Trader__factory.connect(protocol.getOrThrow(TRADER_DXDY)!, ownerAcc)
//  
//    for (let transfer of traderFunding) {
//      proposal = proposal.concat(await sendTokens(timelock, transfer))
//    }
//  
//    for (let sale of fyTokenSelling) {
//      proposal = proposal.concat(await sellFYTokens(trader, sale))
//    }
//  }

  await propose(timelock, proposal, developer)
})()
