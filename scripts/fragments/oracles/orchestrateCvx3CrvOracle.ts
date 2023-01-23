import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, Cvx3CrvOracle } from '../../../typechain'

/**
 * @dev This script permissions the Cvx3CrvOracle
 *
 * Expects the Timelock to have ROOT permissions on the cvx3crvOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateCvx3CrvOracle = async (
  deployer: string,
  cvx3crvOracle: Cvx3CrvOracle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ORCHESTRATE_CVX3CRV_ORACLE`)
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cvx3crvOracle.address,
    data: cvx3crvOracle.interface.encodeFunctionData('grantRoles', [
      [id(cvx3crvOracle.interface, 'setSource(bytes32,bytes32,address,address,address,address)')],
      timelock.address,
    ]),
  })
  console.log(`${'  '.repeat(nesting)}cvx3crvOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: cvx3crvOracle.address,
    data: cvx3crvOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`${'  '.repeat(nesting)}cvx3crvOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: cvx3crvOracle.address,
    data: cvx3crvOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`${'  '.repeat(nesting)}cvx3crvOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
