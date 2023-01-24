/**
 * @dev This script rolls strategies in the protocol to uninitialized pools.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { Pool, Strategy, Timelock } from '../../../typechain'
import { ZERO, ZERO_ADDRESS, MAX256 } from '../../../shared/constants'
import { indent } from '../../../shared/helpers'

export const rollStrategies = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  strategies: Map<string, string>, // strategyId, strategyAddress
  newPools: Map<string, string>, // seriesId, poolAddress
  timelock: Timelock,
  rollData: Array<[string, string, BigNumber, string, boolean]>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ROLL_STRATEGIES`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, nextSeriesId, buffer, lenderAddress, fix] of rollData) {
    const strategyAddress = strategies.get(strategyId)
    if (strategyAddress === undefined) throw `Strategy for ${strategyId} not found`
    else console.log(indent(nesting, `Using strategy at ${strategyAddress} for ${strategyId}`))
    const strategy = (await ethers.getContractAt('Strategy', strategyAddress, ownerAcc)) as Strategy
    const seriesId = await strategy.seriesId()

    const poolAddress = newPools.get(nextSeriesId)
    if (poolAddress === undefined) throw `Pool for ${nextSeriesId} not found`
    else console.log(indent(nesting, `Using pool at ${poolAddress} for ${nextSeriesId}`))
    const nextPool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('setNextPool', [nextPool.address, nextSeriesId]),
    })
    console.log(indent(nesting, `Using ${nextSeriesId}:${nextPool.address} as next pool`))
    if (fix) {
      const base = await ethers.getContractAt('ERC20', await strategy.base(), ownerAcc)
      proposal.push({
        target: base.address,
        data: base.interface.encodeFunctionData('transfer', [poolAddress, 1]),
      })
      console.log(indent(nesting, `Fix tv pool by sending 1 wei of ${await base.symbol()}`))
    }

    const roller = await ethers.getContractAt('Roller', protocol.get('roller') as string, ownerAcc)
    if (!buffer.isZero()) {
      const base = await ethers.getContractAt('ERC20', await strategy.base(), ownerAcc)

      proposal.push({
        target: base.address,
        data: base.interface.encodeFunctionData('transfer', [roller.address, buffer]),
      })
      console.log(
        `${'  '.repeat(nesting)}Transfer ${buffer} of ${base.symbol()} as buffer to roller at ${roller.address}`
      )
    }
    proposal.push({
      target: roller.address,
      data: roller.interface.encodeFunctionData('roll', [
        strategy.address,
        lenderAddress === ZERO_ADDRESS ? ZERO : MAX256,
        lenderAddress,
        timelock.address,
      ]),
    })
    console.log(indent(nesting, `Strategy ${strategyId} rolled onto ${nextSeriesId}`))
  }

  return proposal
}
