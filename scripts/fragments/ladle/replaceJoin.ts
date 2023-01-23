/**
 * @dev This script replaces join for an asset
 *
 * @notice The assetIds can't be already in use
 */

import { addJoin } from './addJoin'
import { removeJoin } from './removeJoin'

import { Ladle, Join, EmergencyBrake } from '../../../typechain'

export const replaceJoin = async (
  ownerAcc: any,
  ladle: Ladle,
  cloak: EmergencyBrake,
  assetId: string,
  join: Join,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}REPLACE_JOIN`)
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await removeJoin(ownerAcc, cloak, ladle, assetId, nesting + 1))
  proposal = proposal.concat(await addJoin(cloak, ladle, assetId, join, nesting + 1))

  return proposal
}
