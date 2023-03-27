/**
 * @dev This script sets the underlying token on rewards wrappers.
 */

import { ERC20RewardsWrapper } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const setRewardsUnderlying = async (
  wrapper: ERC20RewardsWrapper,
  underlyingAddress: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SET_REWARDS_UNDERLYING`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: wrapper.address,
    data: wrapper.interface.encodeFunctionData('set', [underlyingAddress]),
  })
  console.log(indent(nesting, `wrapper(${await wrapper.symbol()}).set(${underlyingAddress})`))

  return proposal
}
