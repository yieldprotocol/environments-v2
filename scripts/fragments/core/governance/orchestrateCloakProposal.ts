import { Timelock, EmergencyBrake } from '../../../../typechain'

/**
 * @dev This script orchestrates the Cloak
 * ROOT access to the Cloak is given to the Timelock.
 * `plan` access is given to the Timelock.
 */

export const orchestrateCloakProposal = async (
  deployer: string,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('revokeRole', [await cloak.ROOT(), deployer]),
  })
  console.log(`cloak.revokeRole(ROOT, deployer)`)

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRoles', [
      [
        '0xde8a0667', // id(cloak.interface, 'plan(address,tuple[])'),
      ],
      timelock.address,
    ]),
  })
  console.log(`cloak.grantRoles(gov, timelock)`)

  return proposal
}
