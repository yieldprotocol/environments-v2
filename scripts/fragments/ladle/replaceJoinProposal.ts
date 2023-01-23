/**
 * @dev This script replaces join for an asset
 *
 * @notice The assetIds can't be already in use
 */

import { addJoinProposal } from './addJoinProposal'
import { removeJoinProposal } from './removeJoinProposal'

import { Ladle, Join, EmergencyBrake } from '../../../typechain'

export const replaceJoinProposal = async (
  ownerAcc: any,
  ladle: Ladle,
  cloak: EmergencyBrake,
  assetId: string,
  join: Join,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal.concat(await removeJoinProposal(ownerAcc, cloak, ladle, assetId))
  proposal.concat(await addJoinProposal(ownerAcc, cloak, ladle, assetId, join))

  return proposal
}
