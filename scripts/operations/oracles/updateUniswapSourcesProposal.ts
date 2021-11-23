/**
 * @dev This script replaces one or more spot data sources in a MultiOracle.
 *
 * It takes as inputs the governance, protocol and sources json address files.
 * It rewrites the sources json address file.
 * @notice This can be used to update RATE and CHI by entering those as quoteId, and using a rate and chi oracle
 */

 import { ethers } from 'hardhat'
 
 import { UniswapV3Oracle } from '../../../typechain'
 
 export const updateUniswapSourcesProposal = async (
   ownerAcc: any,
   protocol: Map<string, string>,
   sources: [string, string, string, string, number][]
 ): Promise<Array<{ target: string; data: string }>>  => {
   const proposal: Array<{ target: string; data: string }> = []
   for (let [baseId, quoteId, oracleName, poolAddress, twapInterval] of sources) {
     if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Address ${poolAddress} contains no code`
 
     const oracle = (await ethers.getContractAt(
       'UniswapV3Oracle',
       protocol.get(oracleName) as string,
       ownerAcc
     )) as unknown as UniswapV3Oracle
     console.log(`Setting up ${poolAddress} as the source for ${baseId}/${quoteId} at ${oracle.address}`)
 
     proposal.push({
       target: oracle.address,
       data: oracle.interface.encodeFunctionData('setSource', [
         baseId,
         quoteId,
         poolAddress,
         twapInterval
       ]),
     })
   }
 
   return proposal
 }
 