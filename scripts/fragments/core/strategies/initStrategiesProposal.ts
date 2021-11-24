/**
 * @dev This script initializes strategies in the protocol.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import { ZERO_ADDRESS, WAD } from '../../../../shared/constants'
import { BigNumber } from 'ethers'

import { ERC20Mock } from '../../../../typechain/ERC20Mock'
import { Strategy } from '../../../../typechain/Strategy'
import { Ladle } from '../../../../typechain/Ladle'


export const initStrategiesProposal = async (
  ownerAcc: any,
  strategies: Map<string, string>,
  ladle: Ladle,
  strategiesInit: Array<[string, string, BigNumber]>
): Promise<Array<{ target: string; data: string }>>  => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, startPoolId, initAmount] of strategiesInit) {
    const strategyAddress = strategies.get(strategyId) as string
    if ((await ethers.provider.getCode(strategyAddress)) === '0x') throw `Address ${strategyAddress} contains no code for a Strategy`

    const strategy: Strategy = (await ethers.getContractAt(
      'Strategy',
      strategyAddress,
      ownerAcc
    )) as Strategy
    const base: ERC20Mock = (await ethers.getContractAt('ERC20Mock', await strategy.base(), ownerAcc)) as ERC20Mock
    
    const startPoolAddress = await ladle.pools(startPoolId)
    if ((await ethers.provider.getCode(startPoolAddress)) === '0x') throw `Address ${startPoolAddress} contains no code for a Pool`

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setNextPool', [startPoolAddress, startPoolId]),
    })
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [strategy.address, initAmount]),
    })
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('startPool', [0, WAD]),
    })
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('transfer', [ZERO_ADDRESS, initAmount]), // Burn the strategy tokens minted
    })
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addIntegration', [strategy.address, true]),
    })
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addToken', [strategy.address, true]),
    })
  }

  return proposal
}