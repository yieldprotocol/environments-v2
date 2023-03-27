/**
 * @dev This script mints rewards tokens on strategies using the rewards wrapper.
 */

import { BigNumber } from 'ethers'
import { Strategy, ERC20RewardsWrapper__factory } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const mintRewardsToken = async (
  strategy: Strategy,
  amount: BigNumber,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MINT_REWARDS_TOKEN`))
  const proposal: Array<{ target: string; data: string }> = []

  const wrapper = ERC20RewardsWrapper__factory.connect(await strategy.rewardsToken(), strategy.signer)

  proposal.push({
    target: wrapper.address,
    data: wrapper.interface.encodeFunctionData('mint', [strategy.address, amount]),
  })
  console.log(
    indent(nesting, `wrapper(${await wrapper.symbol()}).mint(${await strategy.symbol()}, ${amount.toString()})`)
  )

  return proposal
}
