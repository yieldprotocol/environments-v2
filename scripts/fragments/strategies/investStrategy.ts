/**
 * @dev This script invests strategies in a series
 * @notice Make sure you define seriesToInvest in the strategy config.
 */

import { id } from '@yield-protocol/utils-v2'
import { Pool__factory, Strategy__factory } from '../../../typechain'
import { Strategy } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const investStrategy = async (
  ownerAcc: any,
  strategy: Strategy,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `INVEST_STRATEGY`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  const strategyId = strategy.assetId
  const strategyContract = Strategy__factory.connect(strategy.address, ownerAcc)

  if (strategy.seriesToInvest === undefined) throw new Error(`seriesToInvest is not defined for ${getName(strategyId)}`)

  const pool = Pool__factory.connect(strategy.seriesToInvest.pool.address, ownerAcc)
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('grantRoles', [[id(pool.interface, 'init(address)')], strategy.address]),
  })
  console.log(indent(nesting, `pool(${getName(strategy.seriesToInvest.seriesId)}).grantRoles(init, strategy)`))

  console.log(indent(nesting, `Investing ${getName(strategyId)} in ${getName(strategy.seriesToInvest!.seriesId)}`))
  proposal.push({
    target: strategyContract.address,
    data: strategyContract.interface.encodeFunctionData('invest', [strategy.seriesToInvest!.pool.address]),
  })

  return proposal
}
