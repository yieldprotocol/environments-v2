/**
 * @dev This script replaces one or more data sources in a YieldSpaceMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { ethers } from 'hardhat'
import { getName, indent } from '../../../shared/helpers'
import { YieldSpaceMultiOracle } from '../../../typechain'
import { OracleSource } from '../../governance/confTypes'

export const updateYieldSpaceMultiOracleSources = async (
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  compositeSources: OracleSource[],
  pools: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_YIELD_SPACE_MULTI_ORACLE_SOURCES`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let { baseId, quoteId, sourceAddress } of compositeSources) {
    if (sourceAddress !== yieldSpaceMultiOracle.address) {
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
    console.log(indent(nesting, `YieldSpaceMultiOracle: pair: ${pair} set to Pool: ${pool}`))
  }

  return proposal
}
