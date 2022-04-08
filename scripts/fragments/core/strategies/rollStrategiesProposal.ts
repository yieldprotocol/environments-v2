/**
 * @dev This script rolls strategies in the protocol to uninitialized pools.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

export const rollStrategiesProposal = async (
  ownerAcc: any,
  strategies: Map<string, string>, // strategyId, strategyAddress
  newPools: Map<string, string>, // seriesId, poolAddress
  rollData: Array<[string, string, BigNumber, BigNumber]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, nextSeriesId, minRatio, maxRatio] of rollData) {
    const strategyAddress = strategies.get(strategyId)
    if (strategyAddress === undefined) throw `Strategy for ${strategyId} not found`
    else console.log(`Using strategy at ${strategyAddress} for ${strategyId}`)
    const strategy = await ethers.getContractAt('Strategy', strategyAddress, ownerAcc)
    const seriesId = await strategy.seriesId()

    const poolAddress = newPools.get(nextSeriesId)
    if (poolAddress === undefined) throw `Pool for ${nextSeriesId} not found`
    else console.log(`Using pool at ${poolAddress} for ${nextSeriesId}`)
    const nextPool = await ethers.getContractAt('Pool', poolAddress, ownerAcc)

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('endPool'),
    })
    console.log(`Strategy ${strategyId} divested from ${seriesId}`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setNextPool', [nextPool.address, nextSeriesId]),
    })
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('startPool', [minRatio, maxRatio]),
    })
    console.log(`Strategy ${strategyId} rolled onto ${nextSeriesId}`)
  }

  return proposal
}
