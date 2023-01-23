/**
 * @dev This script initializes pools in the protocol.
 * @notice Make sure you define poolInitAmounts in the series config.
 */

import { ethers } from 'hardhat'
import { ZERO_ADDRESS } from '../../../shared/constants'
import { Series } from '../../governance/confTypes'
import { getName } from '../../../shared/helpers'

import { IERC20Metadata__factory, Pool__factory, Timelock } from '../../../typechain'

export const initPool = async (
  ownerAcc: any,
  timelock: Timelock,
  series: Series
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  const poolAddress = series.pool.address
  if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Pool at ${poolAddress} contains no code`
  else console.log(`Using pool at ${poolAddress} for ${series.seriesId}`)
  const pool = Pool__factory.connect(poolAddress, ownerAcc)
  const base = IERC20Metadata__factory.connect(await pool.base(), ownerAcc)

  console.log(`Timelock balance of ${getName(series.base.assetId)} is ${await base.balanceOf(timelock.address)}`)

  // Supply pool with a baseAmount of underlying for initialization
  proposal.push({
    target: base.address,
    data: base.interface.encodeFunctionData('transfer', [poolAddress, series.poolInitAmount!]),
  })
  console.log(`Transferring ${series.poolInitAmount!} of ${getName(series.base.assetId)} from Timelock to Pool`)

  // Initialize pool
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('init', [ZERO_ADDRESS]), // Send the LP tokens to the zero address, maxRatio is set to zero, purposefully reverting this if someone has already initialized the pool
  })
  console.log(`Initializing ${getName(series.pool.assetId)} at ${poolAddress}`)

  return proposal
}
