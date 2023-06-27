/**
 * @dev This script mints strategy tokens on an already funded strategy.
 */
import { indent } from '../../../shared/helpers'
import { Strategy } from '../../../typechain'

export const ejectStrategy = async (
  strategy: Strategy,
  receiver: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `EJECT_STRATEGY`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Eject strategy
  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('eject'),
  })
  console.log(indent(nesting, `Ejected ${await strategy.name()}`));

  return proposal
}
