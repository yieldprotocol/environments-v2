/**
 * @dev This script registers a swap between two tokens in the tokenUpgrade.
 */
import { indent } from '../../../shared/helpers'
import { TokenUpgrade } from '../../../typechain'

export const registerTokenUpgrade = async (
  tokenUpgrade: TokenUpgrade,
  tokenIn: string,
  tokenOut: string,
  merkleRoot: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REGISTER_SWAP`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Mint pool tokens
  proposal.push({
    target: tokenUpgrade.address,
    data: tokenUpgrade.interface.encodeFunctionData('register', [tokenIn, tokenOut, merkleRoot]),
  })
  console.log(indent(nesting, `Registered ${tokenIn} to ${tokenOut} swap`));

  return proposal
}
