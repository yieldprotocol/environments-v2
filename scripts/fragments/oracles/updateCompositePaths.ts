/**
 * @dev This script replaces one or more data paths in a CompositeMultiOracle.
 * These data paths are assets that will be used as base and quote of an iteratively calculated price.
 */

import { getName } from '../../../shared/helpers'
import { CompositeMultiOracle } from '../../../typechain'
import { OraclePath } from '../../governance/confTypes'

export const updateCompositePaths = async (
  compositeOracle: CompositeMultiOracle,
  compositePaths: OraclePath[]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let oraclePath of compositePaths) {
    // There is no need to test that the sources for each step in the path have been set in the composite oracle, as `setPath` would revert in that case.
    proposal.push({
      target: compositeOracle.address,
      data: compositeOracle.interface.encodeFunctionData('setPath', [
        oraclePath.baseId,
        oraclePath.quoteId,
        oraclePath.path,
      ]),
    })
    console.log(`[path: ${getName(oraclePath.baseId)}/${getName(oraclePath.quoteId)} -> ${oraclePath.path}],`)
  }

  return proposal
}
