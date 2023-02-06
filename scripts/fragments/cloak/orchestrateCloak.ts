import { EmergencyBrake } from '../../../typechain'
import { indent } from '../../../shared/helpers'

/**
 * @dev This script orchestrates the Cloak
 * ROOT access to the Cloak is given to the Timelock.
 * `plan` access is given to the Timelock.
 */

export const orchestrateCloak = async (
  deployer: string,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_CLOAK`))
  // Revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('revokeRole', [await cloak.ROOT(), deployer]),
  })
  console.log(indent(nesting, `cloak.revokeRole(ROOT, deployer)`))

  // On deployment the timelock and multisig should get the planner and governor roles, respectively.

  return proposal
}
