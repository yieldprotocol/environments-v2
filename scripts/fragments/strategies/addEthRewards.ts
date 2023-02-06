/**
 * @dev This script calls setRewards and setRewardsToken on strategies
 *  create addEthRewards.ts for each strategy in which we iterate through the strategiesData:
 *  - get strategy address from strategies map (maybe?)
 *  - create proposal to setRewards and setRewardsToken
 */

import { Strategy__factory } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const addEthRewards = async (
  ownerAcc: any,
  strategies: Map<string, string>,
  strategiesData: Array<[string, string, string, number, number, number]>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_ETH_REWARDS`))
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, rewardsAddress, start, stop, rate] of strategiesData) {
    const strategy = Strategy__factory.connect(strategies.getOrThrow(strategyId)!, ownerAcc)

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setRewardsToken', [rewardsAddress]),
    })
    console.log(indent(nesting, `strategy(${strategyId}).setRewardsAddress(${rewardsAddress})`))
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setRewards', [start, stop, rate]),
    })
    console.log(indent(nesting, `strategy(${strategyId}).setRewards(${start}, ${stop}, ${rate})`))
  }

  return proposal
}
