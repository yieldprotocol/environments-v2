/**
 * @dev This script transfers specified tokens from the timelock to destination
 */

import { IERC20Metadata } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const sendTokens = async (
  token: IERC20Metadata,
  receiver: string,
  amount: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SEND_TOKENS`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: token.address,
    data: token.interface.encodeFunctionData('transfer', [receiver, amount]),
  })

  console.log(indent(nesting, `Transferring ${amount} of ${await token.symbol()} to ${receiver}`))

  return proposal
}
