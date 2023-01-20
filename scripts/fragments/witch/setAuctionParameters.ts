/**
 * @dev Configure the auction parameters for Witch v2 liquidations
 * @notice Set max to zero to make a pair not liquidable
 */

import { getName } from '../../../shared/helpers'
import { Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'

export const setAuctionParameters = async (
  witch: Witch,
  auctionLineAndLimits: AuctionLineAndLimit[]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (const { ilkId, baseId, duration, vaultProportion, collateralProportion, max } of auctionLineAndLimits) {
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
    console.log(`Adding baseId: ${getName(baseId)} - ilkId: ${getName(ilkId)} to the Witch`)
  }

  return proposal
}
