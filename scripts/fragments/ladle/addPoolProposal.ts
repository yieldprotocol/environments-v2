/**
 * @dev This script registers one or more pools with the ladle.
 */

import { ethers } from 'hardhat'
import { ZERO_ADDRESS } from '../../../shared/constants'

import { Ladle, Pool } from '../../../typechain'

export const addPoolProposal = async (
  ownerAcc: any,
  ladle: Ladle,
  newPools: Map<string, string> // seriesId, poolAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, poolAddress] of newPools) {
    if (poolAddress === undefined || poolAddress === ZERO_ADDRESS) throw `Pool for ${seriesId} not found`
    else console.log(`Using pool at ${poolAddress} for ${seriesId}`)
    const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool

    // Register pool in Ladle
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addPool', [seriesId, pool.address]),
    })
    console.log(`Adding ${seriesId} pool to Ladle using ${pool.address}`)
  }

  return proposal
}
