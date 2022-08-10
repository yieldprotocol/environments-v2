/**
 * @dev This script sets the pool fees
 */

import { ethers } from 'hardhat'

import { Pool } from '../../../typechain'

export const poolFeesProposal = async (
  pools: Map<string, string>,
  poolFees: Array<[string, number]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, g1] of poolFees) {
    const poolAddress = pools.get(seriesId) as string
    if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Pool at ${poolAddress} contains no code`
    else console.log(`Using pool at ${poolAddress} for ${seriesId}`)
    const pool: Pool = (await ethers.getContractAt('Pool', poolAddress)) as Pool

    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData('setFees', [g1]),
    })
    console.log(`Fees for ${await pool.symbol()} set at ${g1}`)
  }

  return proposal
}
