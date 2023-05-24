/**
 * @dev This script initializes pools in the protocol.
 * @notice Make sure you define poolInitAmounts in the series config.
 */

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { ZERO_ADDRESS } from '../../../shared/constants'
import { Series } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

import { IERC20Metadata__factory, Pool__factory, Timelock } from '../../../typechain'

export const initPool = async (
  ownerAcc: any,
  timelock: Timelock,
  series: Series,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `INIT_POOL`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  const poolAddress = series.pool.address
  if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Pool at ${poolAddress} contains no code`
  else console.log(indent(nesting, `Using pool at ${poolAddress} for ${getName(series.seriesId)}`))
  const pool = Pool__factory.connect(poolAddress, ownerAcc)

  // Initialize pool
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('init', [timelock.address]),
  })
  console.log(indent(nesting, `Initializing ${getName(series.pool.assetId)} at ${poolAddress}`))

  return proposal
}
