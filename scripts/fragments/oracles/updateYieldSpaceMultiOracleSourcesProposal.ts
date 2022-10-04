/**
 * @dev This script replaces one or more data sources in a YieldSpaceMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { PoolOracle, YieldSpaceMultiOracle } from '../../../typechain'

export const updateYieldSpaceMultiOracleSourcesProposal = async (
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  poolOracle: PoolOracle,
  compositeSources: Array<[string, string, string]>,
  pools: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId] of compositeSources) {
    const pool = pools.get(baseId)!
    if ((await ethers.provider.getCode(pool)) === '0x') throw `Pool Address ${pool} contains no code`

    console.log(`Adding ${baseId}/${quoteId} from ${poolOracle.address}`)
    // Check if the poolOracle has been initialised with enough time
    proposal.push({
      target: poolOracle.address,
      data: poolOracle.interface.encodeFunctionData('peek', [pool]),
    })

    proposal.push({
      target: yieldSpaceMultiOracle.address,
      data: yieldSpaceMultiOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, pool]),
    })
    console.log(`pair: ${bytesToString(baseId)}/${bytesToString(quoteId)} -> ${pool}`)
  }

  return proposal
}
