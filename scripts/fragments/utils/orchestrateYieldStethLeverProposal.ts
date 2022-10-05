import { Giver, YieldStEthLever } from '../../../typechain'
import { id } from '@yield-protocol/utils-v2'

/**
 * @dev This script orchestrates the YieldStEthLever
 * The YieldStEthLever gets access on Giver for give & seize
 */

export const orchestrateYieldStethLeverProposal = async (
  yieldStEthLever: YieldStEthLever,
  giver: Giver
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('grantRoles', [
      [id(giver.interface, 'give(bytes12,address)')],
      yieldStEthLever.address,
    ]),
  })
  console.log(`giver.grantRoles('give', yieldStEthLever)`)

  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('grantRoles', [
      [id(giver.interface, 'seize(bytes12,address)')],
      yieldStEthLever.address,
    ]),
  })
  console.log(`giver.grantRoles('seize', yieldStEthLever)`)

  return proposal
}
