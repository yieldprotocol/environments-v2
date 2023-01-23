/**
 * @dev This script replaces one or more data sources in a YieldSpaceMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { YieldSpaceMultiOracle } from '../../../typechain'

export const updateYieldSpaceMultiOracleSources = async (
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  compositeSources: Array<[string, string, string]>,
  pools: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, oracle] of compositeSources) {
    if (oracle !== yieldSpaceMultiOracle.address) {
      // Not all compositeSources are necessarily YieldSpaceMultiOracle sources
      continue
    }

    const pair = `${getName(baseId)}/${getName(quoteId)}`

    const pool = pools.getOrThrow(baseId)
    if ((await ethers.provider.getCode(pool)) === '0x') throw `Pool Address ${pool} contains no code`

    proposal.push({
      target: yieldSpaceMultiOracle.address,
      data: yieldSpaceMultiOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, pool]),
    })
    console.log(`${'  '.repeat(nesting)}YieldSpaceMultiOracle: pair: ${pair} set to Pool: ${pool}`)
  }

  return proposal
}
