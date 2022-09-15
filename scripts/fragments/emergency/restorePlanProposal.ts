/**
 * @dev This script restores the orchestration after the execution of an emergency plan.
 */

import { EmergencyBrake } from '../../../typechain'

export const restorePlanProposal = async (
  cloak: EmergencyBrake,
  planHash: string
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('restore', [planHash]),
  })
  console.log(`Restored ${planHash}`)
  return proposal
}
