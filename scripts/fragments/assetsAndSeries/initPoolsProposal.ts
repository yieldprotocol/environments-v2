/**
 * @dev This script initializes pools in the protocol.
 */

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { ZERO_ADDRESS } from '../../../shared/constants'

import { IERC20Metadata, Pool, Timelock } from '../../../typechain'

export const initPoolsProposal = async (
  ownerAcc: any,
  timelock: Timelock,
  newPools: Map<string, string>,
  poolsInit: Array<[string, string, BigNumber, BigNumber]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, baseAmount] of poolsInit) {
    const poolAddress = newPools.get(seriesId) as string
    if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Pool at ${poolAddress} contains no code`
    else console.log(`Using pool at ${poolAddress} for ${seriesId}`)
    const pool: Pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool
    const base: IERC20Metadata = (await ethers.getContractAt('IERC20', await pool.base(), ownerAcc)) as IERC20Metadata
    const baseName = await base.symbol()

    console.log(`Timelock balance of ${baseName} is ${await base.balanceOf(timelock.address)}`)

    // Supply pool with a baseAmount of underlying for initialization
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [poolAddress, baseAmount]),
    })
    console.log(`Transferring ${baseAmount} of ${baseName} from Timelock to Pool`)

    // Initialize pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData('init', [ZERO_ADDRESS]), // Send the LP tokens to the zero address, maxRatio is set to zero, purposefully reverting this if someone has already initialized the pool
    })
    console.log(`Initializing ${await pool.symbol()} at ${poolAddress}`)
  }

  return proposal
}
