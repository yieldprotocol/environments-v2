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
  console.log(`\n${'  '.repeat(nesting)}SET_LINE_AND_LIMIT`)
  const proposal: Array<{ target: string; data: string }> = []

  console.log(`${'  '.repeat(nesting)}Witch#setLineAndLimit`)
  console.log(`${'  '.repeat(nesting + 1)}ilkId: ${getName(auctionLineAndLimits.ilkId)}`)
  console.log(`${'  '.repeat(nesting + 1)}baseId: ${getName(auctionLineAndLimits.baseId)}`)
  console.log(`${'  '.repeat(nesting + 1)}duration: ${auctionLineAndLimits.duration} seconds`)
  console.log(
    `${'  '.repeat(nesting + 1)}vaultProportion: ${ethers.utils.formatUnits(auctionLineAndLimits.vaultProportion)}`
  )
  console.log(
    `${'  '.repeat(nesting + 1)}collateralProportion: ${ethers.utils.formatUnits(
      auctionLineAndLimits.collateralProportion
    )}`
  )
  console.log(`${'  '.repeat(nesting + 1)}max: ${ethers.utils.formatUnits(auctionLineAndLimits.max)}`)

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
