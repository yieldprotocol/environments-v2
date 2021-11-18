/**
 * @dev This script initializes pools in the protocol.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { ZERO_ADDRESS } from '../../../shared/constants'

import { ERC20Mock, Pool, Ladle } from '../../../typechain'


export const initPoolsProposal = async (
  ownerAcc: any,
  ladle: Ladle,
  poolsInit: Array<string>
): Promise<Array<{ target: string; data: string }>>  => {

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let poolId of poolsInit) {
    const poolAddress = await ladle.pools(poolId)
    const pool: Pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool

    const base: ERC20Mock = (await ethers.getContractAt('ERC20Mock', await pool.base(), ownerAcc)) as ERC20Mock
    const baseUnit: BigNumber = BigNumber.from(10).pow(await base.decimals())

    // Supply pool with a hundred tokens of underlying for initialization
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [poolAddress, baseUnit.mul(100)]),
    })

    // Initialize pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData('mint', [ZERO_ADDRESS, ZERO_ADDRESS, 0, 0]), // Send the LP tokens to the zero address, maxRatio is set to zero, purposefully reverting this if someone has already initialized the pool
    })
    console.log(`Initalizing ${await pool.symbol()} at ${poolAddress}`)
  }

  return proposal
}
