/**
 * @dev This script replaces one or more data paths in a CompositeMultiOracle.
 * These data paths are assets that will be used as base and quote of an iteratively calculated price.
 */

import { getName } from '../../../shared/helpers'
import { CompositeMultiOracle } from '../../../typechain'

export const updateCompositePathsProposal = async (
  compositeOracle: CompositeMultiOracle,
  compositePaths: [string, string, string[]][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, path] of compositePaths) {
    // There is no need to test that the sources for each step in the path have been set in the composite oracle, as `setPath` would revert in that case.
    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setPath', [baseId, quoteId, path]),
    })
    console.log(`[path: ${getName(baseId)}/${getName(quoteId)} -> ${path}],`)
  }

  return proposal
}
