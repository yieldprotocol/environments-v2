import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { EmergencyBrake, PoolNonTv, Timelock } from '../../../typechain'

/**
 * @dev This script orchestrates new pools
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateNewPoolsProposal = async (
  deployer: string,
  pool: PoolNonTv,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
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
    data: pool.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`cauldron.grantRole(ROOT, cloak)`)

  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`pool.revokeRole(ROOT, deployer)`)

  return proposal
}
