import { ethers } from 'hardhat'

import { FYToken, PoolFactory } from '../../../typechain'

export const deployPoolsProposal = async (
  ownerAcc: any,
  poolFactory: PoolFactory,
  poolData: Array<[string, string]>,
): Promise<Array<{ target: string; data: string }>>  => {
 
   // Build the proposal
   const proposal: Array<{ target: string; data: string }> = []
 
   for (let [seriesId, fyTokenAddress] of poolData) {
    if ((await ethers.provider.getCode(fyTokenAddress)) === '0x') throw `FYToken at ${fyTokenAddress} contains no code`
    else console.log(`Using join at ${fyTokenAddress} for ${seriesId}`)
    const fyToken = await ethers.getContractAt('FYToken', fyTokenAddress, ownerAcc) as unknown as FYToken
    const baseAddress = await fyToken.underlying()

    proposal.push({
      target: poolFactory.address,
      data: poolFactory.interface.encodeFunctionData('createPool', [baseAddress, fyTokenAddress]),
    })
  }
  
  return proposal
 }
 