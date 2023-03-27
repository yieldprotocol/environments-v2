/**
 * @dev This script mints strategy tokens on an already funded strategy.
 */
import { indent } from '../../../shared/helpers'
import { Strategy } from '../../../typechain'

export const mintStrategy = async (
  strategy: Strategy,
  receiver: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MINT__STRATEGY`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Mint strategy tokens
  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('mint(address)', [receiver]),
  })
  console.log(indent(nesting, `Minted ${await strategy.name()} to ${receiver}`));

  return proposal
}
