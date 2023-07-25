/**
 * @dev This script replaces one or more data sources in a YieldSpaceMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { getName, indent } from '../../../shared/helpers'
import { YieldSpaceMultiOracle } from '../../../typechain'
import { OracleSource } from '../../governance/confTypes'

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

export const updateYieldSpaceMultiOracleSources = async (
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  sources: OracleSource[],
  pools: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_YIELD_SPACE_MULTI_ORACLE_SOURCES`))
  const proposal: Array<{ target: string; data: string }> = []

  const added = new Set<string>()

  for (let source of sources) {
    const pair = `${getName(source.baseId)}/${getName(source.quoteId)}`

    if (added.has(pair) || added.has(`${getName(source.quoteId)}/${getName(source.baseId)}`)) {
      console.log(indent(nesting, `YieldSpaceMultiOracle: ${pair} already dealt with, skipping`))
      continue
    }
    added.add(pair)

    const proposalArray = await updateYieldSpaceMultiOracleSource(
      yieldSpaceMultiOracle,
      source.baseId,
      source.quoteId,
      pools.getOrThrow(source.baseId),
      nesting + 1
    )

    proposalArray.forEach((arr) => proposal.push(arr))
  }

  return proposal
}
