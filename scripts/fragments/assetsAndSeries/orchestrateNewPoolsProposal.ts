import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Pool, Timelock, EmergencyBrake, Cauldron } from '../../../typechain'

/**
 * @dev This script orchestrates the Cauldron
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

/**
 * @dev This script orchestrates the FYTokenFactory
 * The Cloak gets ROOT access. ROOT access is removed from the deployer.
 */
export const orchestrateNewPoolsProposal = async (
  deployer: string,
  pool: Pool,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  console.log(pool.interface)
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('grantRoles', [
      [id(pool.interface, 'setFees(uint16)'), id(pool.interface, 'init(address,address,uint256,uint256)')],
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
