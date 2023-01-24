/**
 * @dev This script registers one or more pools with the ladle.
 */

import { Ladle } from '../../../typechain'
import { getName, indent } from '../../../shared/helpers'

export const addPool = async (
  ladle: Ladle,
  seriesId: string,
  poolAddress: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_POOL`))
  let proposal: Array<{ target: string; data: string }> = []
  // Register pool in Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addPool', [seriesId, poolAddress]),
  })
  console.log(indent(nesting, `Adding ${getName(seriesId)} pool to Ladle using ${poolAddress}`))

  return proposal
}
