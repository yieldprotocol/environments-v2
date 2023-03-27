/**
 * @dev This script adds a rewards plan to a strategy
 */

import { Strategy } from '../../../typechain'
import { indent } from '../../../shared/helpers'
import { RewardsPlan } from '../../governance/confTypes'

export const addRewardsPlan = async (
  strategy: Strategy,
  rewardsPlan: RewardsPlan,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_REWARDS_PLAN`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('setRewards', [rewardsPlan.start, rewardsPlan.stop, rewardsPlan.rate]),
  })
  console.log(
    indent(
      nesting,
      `strategy(${await strategy.symbol()}).setRewards(${rewardsPlan.start}, ${rewardsPlan.stop}, ${rewardsPlan.rate})`
    )
  )

  return proposal
}
