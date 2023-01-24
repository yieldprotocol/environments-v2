/**
 * @dev Configure the auction parameters for Witch v2 liquidations
 * @notice Set max to zero to make a pair not liquidable
 */

import { getName, indent } from '../../../shared/helpers'
import { Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'

export const setAuctionParameters = async (
  witch: Witch,
  auctionLineAndLimits: AuctionLineAndLimit[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SET_AUCTION_PARAMETERS`))
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
    console.log(indent(nesting, `Adding baseId: ${getName(baseId)} - ilkId: ${getName(ilkId)} to the Witch`))
  }

  return proposal
}
