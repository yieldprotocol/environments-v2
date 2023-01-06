/**
 * @dev This script registers one or more pools with the ladle.
 */

import { Ladle } from '../../../typechain'

export const addPool = async (
  ladle: Ladle,
  seriesId: string,
  poolAddress: string
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  // Register pool in Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addPool', [seriesId, poolAddress]),
  })
  console.log(`Adding ${seriesId} pool to Ladle using ${poolAddress}`)

  return proposal
}
