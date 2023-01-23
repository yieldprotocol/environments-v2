/**
 * @dev This script invests strategies in a series
 * @notice Make sure you define seriesToInvest in the strategy config.
 */

import { Strategy__factory } from '../../../typechain'
import { Strategy } from '../../governance/confTypes'
import { getName } from '../../../shared/helpers'

export const investStrategy = async (
  ownerAcc: any,
  strategy: Strategy
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  const strategyId = strategy.assetId
  const strategyContract = Strategy__factory.connect(strategy.address, ownerAcc)

  console.log(`Investing ${getName(strategyId)} in ${getName(strategy.seriesToInvest!.seriesId)}`)
  proposal.push({
    target: strategyContract.address,
    data: strategyContract.interface.encodeFunctionData('invest', [strategy.seriesToInvest!.pool.address]),
  })

  return proposal
}
