/**
 * @dev This script burns strategy tokens already sent to a strategy.
 */
import { indent } from '../../../shared/helpers'
import { Strategy } from '../../../typechain'

export const burnDivestedStrategy = async (
  strategy: Strategy,
  receiver: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `BURN_DIVESTED_STRATEGY`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Eject strategy
  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('burnDivested', [receiver]),
  })
  console.log(indent(nesting, `Burnt ${await strategy.name()} to ${receiver}`));

  return proposal
}
