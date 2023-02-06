/**
 * @dev This script replaces one or more data sources in a UniswapV3Oracle.
 */

import { ethers } from 'hardhat'

import { UniswapV3Oracle } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const updateUniswapSources = async (
  oracle: UniswapV3Oracle,
  sources: [string, string, string, number][],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_UNISWAP_SOURCES`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, poolAddress, twapInterval] of sources) {
    if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Address ${poolAddress} contains no code`

    console.log(
      indent(nesting, `Setting up ${poolAddress} as the source for ${baseId}/${quoteId} at ${oracle.address}`)
    )

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [baseId, quoteId, poolAddress, twapInterval]),
    })
  }

  return proposal
}
