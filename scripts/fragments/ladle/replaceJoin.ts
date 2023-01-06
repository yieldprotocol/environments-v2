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
  join: Join
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await removeJoin(ownerAcc, cloak, ladle, assetId))
  proposal = proposal.concat(await addJoin(cloak, ladle, assetId, join))

  return proposal
}
