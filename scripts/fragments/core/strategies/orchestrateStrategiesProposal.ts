/**
 * @dev This script orchestrates one or more strategies in the protocol.
 *
 * The Timelock gets access to governance functions in the new Strategies.
 * The ROOT role is revoked from the deployer
 */

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../../shared/constants'
import { Timelock, Strategy, Roller } from '../../../../typechain'

export const orchestrateStrategiesProposal = async (
  ownerAcc: any,
  strategies: Map<string, string>,
  roller: Roller,
  timelock: Timelock,
  strategiesData: Array<[string, string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [name, symbol, baseId, ,] of strategiesData) {
    const strategy = (await ethers.getContractAt('Strategy', strategies.get(symbol) as string, ownerAcc)) as Strategy

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('grantRoles', [
        [
          ROOT,
          id(strategy.interface, 'setRewardsToken(address)'),
          id(strategy.interface, 'setRewards(uint32,uint32,uint96)'),
          id(strategy.interface, 'setYield(address)'),
          id(strategy.interface, 'setTokenId(bytes6)'),
          id(strategy.interface, 'resetTokenJoin()'),
          id(strategy.interface, 'setNextPool(address,bytes6)'),
          id(strategy.interface, 'startPool(uint256,uint256)'),
        ],
        timelock.address,
      ]),
    })
    console.log(`strategy(${symbol}).grantRoles(gov, timelock)`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('grantRoles', [
        [id(strategy.interface, 'startPool(uint256,uint256)')],
        roller.address,
      ]),
    })
    console.log(`strategy(${symbol}).grantRoles(startPool, roller)`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address]),
    })
    console.log(`strategy(${symbol}).revokeRole(ROOT, deployer)`)
  }

  return proposal
}
