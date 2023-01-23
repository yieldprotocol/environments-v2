/**
 * @dev Protect an address from liquidations.
 */

import { Witch } from '../../../typechain'

export const protectFromLiquidations = async (
  witch: Witch,
  owner: string,
  protect: boolean,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('setProtected', [owner, protect]),
  })
  console.log(`${owner} is protected from liquidations`)

  return proposal
}
