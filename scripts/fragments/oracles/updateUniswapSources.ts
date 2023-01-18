/**
 * @dev This script replaces one or more data sources in a UniswapV3Oracle.
 */

import { ethers } from 'hardhat'

import { UniswapV3Oracle } from '../../../typechain'

export const updateUniswapSources = async (
  oracle: UniswapV3Oracle,
  sources: [string, string, string, number][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, poolAddress, twapInterval] of sources) {
    if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Address ${poolAddress} contains no code`

    console.log(`Setting up ${poolAddress} as the source for ${baseId}/${quoteId} at ${oracle.address}`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [baseId, quoteId, poolAddress, twapInterval]),
    })
  }

  return proposal
}
