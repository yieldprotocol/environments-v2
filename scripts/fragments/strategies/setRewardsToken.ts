/**
 * @dev This script sets the rewards token on strategies. It can only be called once per strategy.
 */

import { Strategy } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const setRewardsToken = async (
  strategy: Strategy,
  rewardsTokenAddress: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SET_REWARDS_TOKEN`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('setRewardsToken', [rewardsTokenAddress]),
  })
  console.log(indent(nesting, `strategy(${await strategy.symbol()}).setRewardsAddress(${rewardsTokenAddress})`))

  return proposal
}
