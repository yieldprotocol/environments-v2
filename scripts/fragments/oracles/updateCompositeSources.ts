/**
 * @dev This script replaces one or more data sources in a CompositeMultiOracle.
 * These data sources are IOracle contracts that will be used either directly or as part of paths.
 */

import { ZERO_ADDRESS } from '../../../shared/constants'
import { CompositeMultiOracle } from '../../../typechain'
import { getName } from '../../../shared/helpers'

export const updateCompositeSources = async (
  compositeOracle: CompositeMultiOracle,
  compositeSources: Array<[string, string, string]>,
  overrideExistent: boolean = true
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  const added = new Set<string>()

  for (let [baseId, quoteId, oracleAddress] of compositeSources) {
    const pair = `${getName(baseId)}/${getName(quoteId)}`

    if (added.has(pair) || added.has(`${getName(quoteId)}/${getName(baseId)}`)) {
      console.log(`CompositeMultiOracle: ${pair} already dealt with, skipping`)
      continue
    }
    added.add(pair)

    const existent = await compositeOracle.sources(baseId, quoteId)
    if (existent === ZERO_ADDRESS || overrideExistent) {
      proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('setSource', [baseId, quoteId, oracleAddress]),
      })
      console.log(`CompositeMultiOracle: pair: ${pair} set to ${oracleAddress}`)
    } else {
      console.log(`CompositeMultiOracle: pair: ${pair} already set to ${existent}`)
    }
  }

  return proposal
}
