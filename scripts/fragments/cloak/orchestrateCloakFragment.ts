import { EmergencyBrake } from '../../../typechain'

/**
 * @dev This script orchestrates the Cloak
 * ROOT access to the Cloak is given to the Timelock.
 * `plan` access is given to the Timelock.
 */

export const orchestrateCloakFragment = async (
  deployer: string,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('revokeRole', [await cloak.ROOT(), deployer]),
  })
  console.log(`cloak.revokeRole(ROOT, deployer)`)

  // On deployment the timelock and multisig should get the planner and governor roles, respectively.

  return proposal
}
