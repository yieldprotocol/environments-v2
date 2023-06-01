/**
 * @dev This script replaces one or more data sources in a YieldSpaceMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { ethers } from 'hardhat'
import { getName, indent } from '../../../shared/helpers'
import { YieldSpaceMultiOracle } from '../../../typechain'

export const updateYieldSpaceMultiOracleSource = async (
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  baseId: string,
  quoteId: string,
  pool: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_YIELD_SPACE_MULTI_ORACLE_SOURCE`))
  const proposal: Array<{ target: string; data: string }> = []

  const pair = `${getName(baseId)}/${getName(quoteId)}`

  proposal.push({
    target: yieldSpaceMultiOracle.address,
    data: yieldSpaceMultiOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, pool]),
  })
  console.log(indent(nesting, `YieldSpaceMultiOracle: pair: ${pair} set to Pool: ${pool}`))

  return proposal
}
