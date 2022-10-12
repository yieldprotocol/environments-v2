/**
 * @dev Protect an address from liquidations.
 */

import { bytesToString } from '../../../shared/helpers'

import { Witch } from '../../../typechain'

export const protectFromLiquidationsFragment = async (
  witch: Witch,
  owner: string
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('setProtected', [owner, true]),
  })
  console.log(`${owner} is protected from liqidations`)

  return proposal
}
