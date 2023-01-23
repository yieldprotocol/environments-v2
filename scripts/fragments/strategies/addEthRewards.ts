/**
 * @dev This script calls setRewards and setRewardsToken on strategies
 *  create addEthRewards.ts for each strategy in which we iterate through the strategiesData:
 *  - get strategy address from strategies map (maybe?)
 *  - create proposal to setRewards and setRewardsToken
 */

import { Strategy__factory } from '../../../typechain'

export const addEthRewards = async (
  ownerAcc: any,
  strategies: Map<string, string>,
  strategiesData: Array<[string, string, string, number, number, number]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, rewardsAddress, start, stop, rate] of strategiesData) {
    const strategy = Strategy__factory.connect(strategies.getOrThrow(strategyId)!, ownerAcc)

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setRewardsToken', [rewardsAddress]),
    })
    console.log(`strategy(${strategyId}).setRewardsAddress(${rewardsAddress})`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setRewards', [start, stop, rate]),
    })
    console.log(`strategy(${strategyId}).setRewards(${start}, ${stop}, ${rate})`)
  }

  return proposal
}
