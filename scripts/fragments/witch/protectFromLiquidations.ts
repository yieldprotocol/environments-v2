/**
 * @dev Protect an address from liquidations.
 */

import { Witch } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const protectFromLiquidations = async (
  witch: Witch,
  owner: string,
  protect: boolean,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `PROTECT_FROM_LIQUIDATIONS`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: witch.address,
    data: witch.interface.encodeFunctionData('setProtected', [owner, protect]),
  })
  console.log(indent(nesting, `${owner} is protected from liquidations`))

  return proposal
}
