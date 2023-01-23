/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'

export const setLineAndLimit = async (
  witch: Witch,
  auctionLineAndLimits: AuctionLineAndLimit,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  console.log(
    `Witch#setLineAndLimit(ilkId: ${getName(auctionLineAndLimits.ilkId)}, baseId: ${getName(
      auctionLineAndLimits.baseId
    )}, duration: ${auctionLineAndLimits.duration} seconds, vaultProportion: ${ethers.utils.formatUnits(
      auctionLineAndLimits.vaultProportion
    )}, collateralProportion: ${ethers.utils.formatUnits(
      auctionLineAndLimits.collateralProportion
    )}, max: ${ethers.utils.formatUnits(auctionLineAndLimits.max)})`
  )
  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('setLineAndLimit', [
      auctionLineAndLimits.ilkId,
      auctionLineAndLimits.baseId,
      auctionLineAndLimits.duration,
      auctionLineAndLimits.vaultProportion,
      auctionLineAndLimits.collateralProportion,
      auctionLineAndLimits.max,
    ]),
  })

  return proposal
}
