import { id } from '@yield-protocol/utils-v2'
import { Pool, Timelock, AccessControl__factory } from '../../../typechain'
import { removeDeployer } from '../core/removeDeployer'

/**
 * @dev This script orchestrates new pools
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestratePool = async (
  timelock: Timelock,
  pool: Pool,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ORCHESTRATE_POOL`)
  let proposal: Array<{ target: string; data: string }> = []

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('grantRoles', [
      [id(pool.interface, 'setFees(uint16)'), id(pool.interface, 'init(address)')],
      timelock.address,
    ]),
  })
  console.log(`${'  '.repeat(nesting)}pool.grantRoles(gov, timelock)`)

  // Revoke ROOT from the deployer
  proposal = proposal.concat(
    await removeDeployer(AccessControl__factory.connect(pool.address, pool.signer), nesting + 1)
  )

  return proposal
}
