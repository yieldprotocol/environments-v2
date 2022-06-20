/**
 * @dev This script rolls strategies in the protocol to uninitialized pools.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { Pool, Strategy, Timelock } from '../../../../typechain'
import { ZERO, ZERO_ADDRESS, MAX256 } from '../../../../shared/constants'

export const rollStrategiesProposal = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  strategies: Map<string, string>, // strategyId, strategyAddress
  newPools: Map<string, string>, // seriesId, poolAddress
  timelock: Timelock,
  rollData: Array<[string, string, BigNumber, string, boolean]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, nextSeriesId, buffer, lenderAddress, fix] of rollData) {
    const strategyAddress = strategies.get(strategyId)
    if (strategyAddress === undefined) throw `Strategy for ${strategyId} not found`
    else console.log(`Using strategy at ${strategyAddress} for ${strategyId}`)
    const strategy = (await ethers.getContractAt('Strategy', strategyAddress, ownerAcc)) as Strategy
    const seriesId = await strategy.seriesId()

    const poolAddress = newPools.get(nextSeriesId)
    if (poolAddress === undefined) throw `Pool for ${nextSeriesId} not found`
    else console.log(`Using pool at ${poolAddress} for ${nextSeriesId}`)
    const nextPool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool

    console.log(`Strategy ${strategyId} divested from ${seriesId}`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setNextPool', [nextPool.address, nextSeriesId]),
    })
    if (fix) {
      const base = await ethers.getContractAt('ERC20', await strategy.base(), ownerAcc)
      proposal.push({
        target: base.address,
        data: base.interface.encodeFunctionData('transfer', [poolAddress, 1]),
      })
    }
    const base = await ethers.getContractAt('ERC20', await strategy.base(), ownerAcc)
    const roller = await ethers.getContractAt('Roller', protocol.get('roller') as string, ownerAcc)

    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [roller.address, buffer]),
    })
    proposal.push({
      target: roller.address,
      data: roller.interface.encodeFunctionData('roll', [
        strategy.address,
        lenderAddress === ZERO_ADDRESS ? ZERO : MAX256,
        lenderAddress,
        timelock.address,
      ]),
    })

    console.log(`Strategy ${strategyId} rolled onto ${nextSeriesId}`)
  }

  return proposal
}
