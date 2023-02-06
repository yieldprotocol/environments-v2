/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { ZERO_ADDRESS } from '../../../shared/constants'
import { CompositeMultiOracle } from '../../../typechain'
import { getName, indent } from '../../../shared/helpers'
import { OracleSource } from '../../governance/confTypes'

export const updateCompositeSources = async (
  compositeOracle: CompositeMultiOracle,
  compositeSources: OracleSource[],
  overrideExistent: boolean = true,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_COMPOSITE_SOURCES`))
  const proposal: Array<{ target: string; data: string }> = []

  const added = new Set<string>()

  for (let source of compositeSources) {
    const pair = `${getName(source.baseId)}/${getName(source.quoteId)}`

    if (added.has(pair) || added.has(`${getName(source.quoteId)}/${getName(source.baseId)}`)) {
      console.log(indent(nesting, `CompositeMultiOracle: ${pair} already dealt with, skipping`))
      continue
    }
    added.add(pair)

    const existent = await compositeOracle.sources(source.baseId, source.quoteId)
    if (existent === ZERO_ADDRESS || overrideExistent) {
      proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('setSource', [
          source.baseId,
          source.quoteId,
          source.sourceAddress,
        ]),
      })
      console.log(indent(nesting, `CompositeMultiOracle: pair: ${pair} set to ${source.sourceAddress}`))
    } else {
      console.log(indent(nesting, `CompositeMultiOracle: pair: ${pair} already set to ${existent}`))
    }
  }

  return proposal
}
