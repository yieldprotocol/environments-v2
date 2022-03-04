/**
 * @dev This script initializes strategies in the protocol.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import { ZERO_ADDRESS, MAX256 } from '../../../../shared/constants'
import { BigNumber } from 'ethers'

import { ERC20Mock, Strategy, Ladle, Timelock } from '../../../../typechain'

export const initStrategiesProposal = async (
  ownerAcc: any,
  strategies: Map<string, string>,
  ladle: Ladle,
  timelock: Timelock,
  strategiesInit: Array<[string, string, string, BigNumber]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, startPoolAddress, startPoolId, initAmount] of strategiesInit) {
    const strategyAddress = strategies.get(strategyId) as string
    if ((await ethers.provider.getCode(strategyAddress)) === '0x')
      throw `Address ${strategyAddress} contains no code for a Strategy`

    const strategy: Strategy = (await ethers.getContractAt('Strategy', strategyAddress, ownerAcc)) as Strategy
    const base: ERC20Mock = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      await strategy.base(),
      ownerAcc
    )) as ERC20Mock

    // The test below doesn't work if the pool is added to the ladle in the same proposal.
    const startPoolAddress1 = await ladle.pools(startPoolAddress)
    if ((await ethers.provider.getCode(startPoolAddress1)) === '0x')
      throw `Address ${startPoolAddress1} contains no code for the ${startPoolId} Pool`

    console.log(`Timelock balance of ${await base.name()} is ${await base.balanceOf(timelock.address)}`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setNextPool', [startPoolAddress1, startPoolAddress]),
    })
    console.log(`Setting ${startPoolAddress1} as the next pool for ${strategyId}`)
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [strategy.address, startPoolId]),
    })
    console.log(`Transferring ${startPoolId} of ${base.address} to ${strategy.address}`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('startPool', [0, MAX256]),
    })
    console.log(`Starting ${strategyId} at ${strategy.address}`)
    // The fragment below only works with pools that have been initialized with underlying only
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('transfer', [ZERO_ADDRESS, startPoolId]), // Burn the strategy tokens minted
    })
    console.log(`Burning strategy tokens`)
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addIntegration', [strategy.address, true]),
    })
    console.log(`Setting ${strategyId} as an integration in the Ladle`)
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addToken', [strategy.address, true]),
    })
    console.log(`Setting ${strategyId} as a token in the Ladle`)
  }

  return proposal
}
