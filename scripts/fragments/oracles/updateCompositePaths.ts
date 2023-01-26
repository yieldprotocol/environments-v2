/**
 * @dev This script replaces one or more data paths in a CompositeMultiOracle.
 * These data paths are assets that will be used as base and quote of an iteratively calculated price.
 */

import { getName, indent } from '../../../shared/helpers'
import { CompositeMultiOracle } from '../../../typechain'
import { OraclePath } from '../../governance/confTypes'

export const updateCompositePaths = async (
  compositeOracle: CompositeMultiOracle,
  compositePaths: OraclePath[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_COMPOSITE_PATHS`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let path of compositePaths) {
    // There is no need to test that the sources for each step in the path have been set in the composite oracle, as `setPath` would revert in that case.
    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setPath', [path.baseId, path.quoteId, path.path]),
    })
    console.log(indent(nesting, `path: ${getName(path.baseId)}/${getName(path.quoteId)} -> ${path.path}`))
  }

  return proposal
}
