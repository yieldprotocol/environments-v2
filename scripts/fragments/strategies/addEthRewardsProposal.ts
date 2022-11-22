/**
 * @dev This script calls setRewards and setRewardsToken on strategies
 *  create addEthRewardsProposal.ts for each strategy in which we iterate through the strategiesData:
 *  - get strategy address from strategies map (maybe?)
 *  - create proposal to setRewards and setRewardsToken
 */

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, Strategy, Roller, Strategy__factory } from '../../../typechain'

export const addEthRewardsProposal = async (
  ownerAcc: any,
  timelock: Timelock,
  strategies: Map<string, string>,
  strategiesData: Array<[string, string, string, string, number, number, number]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [name, symbol, baseId, rewardsAddress, start, stop, rate] of strategiesData) {
    const strategy = Strategy__factory.connect(strategies.getOrThrow(symbol)!, ownerAcc) as Strategy

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setRewardsToken', [rewardsAddress]),
    })
    console.log(`strategy(${symbol}).setRewardsAddress(${rewardsAddress})`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setRewards', [start, stop, rate]),
    })
    console.log(`strategy(${symbol}).setRewards(${start}, ${stop}, ${rate})`)
  }

  return proposal
}
