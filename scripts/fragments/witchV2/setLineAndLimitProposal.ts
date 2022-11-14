/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { bytesToString } from '../../../shared/helpers'
import { Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'

export const setLineAndLimitProposal = (
  witch: Witch,
  auctionLineAndLimits: AuctionLineAndLimit[]
): Array<{ target: string; data: string }> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (const { ilkId, baseId, duration, vaultProportion, collateralProportion, max } of auctionLineAndLimits) {
    console.log(
      `Witch#setLineAndLimit(${bytesToString(ilkId)}, ${bytesToString(
        baseId
      )}, ${duration}, ${vaultProportion}, ${collateralProportion}, ${max})`
    )
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setLineAndLimit', [
        ilkId,
        baseId,
        duration,
        vaultProportion,
        collateralProportion,
        max,
      ]),
    })
  }

  return proposal
}
