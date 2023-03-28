/**
 * @dev This script registers a swap between two tokens in the tokenSwap.
 */
import { indent } from '../../../shared/helpers'
import { TokenSwap } from '../../../typechain'

export const registerSwap = async (
  tokenSwap: TokenSwap,
  tokenIn: string,
  tokenOut: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REGISTER_SWAP`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Mint pool tokens
  proposal.push({
    target: tokenSwap.address,
    data: tokenSwap.interface.encodeFunctionData('register', [tokenIn, tokenOut]),
  })
  console.log(indent(nesting, `Registered ${tokenIn} to ${tokenOut} swap`));

  return proposal
}
