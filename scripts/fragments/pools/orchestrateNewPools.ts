import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Pool, Timelock, OldEmergencyBrake } from '../../../typechain'

/**
 * @dev This script orchestrates new pools
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateNewPools = async (
  deployer: string,
  pool: Pool,
  timelock: Timelock
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Revoke ROOT from the deployer
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('grantRoles', [
      [id(pool.interface, 'setFees(uint16)'), id(pool.interface, 'init(address)')],
      timelock.address,
    ]),
  })
  console.log(`pool.grantRoles(gov, timelock)`)

  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`pool.revokeRole(ROOT, deployer)`)

  return proposal
}