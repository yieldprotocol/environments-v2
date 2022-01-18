import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, ConvexYieldWrapper } from '../../../typechain'
/**
 * @dev This script permissions the ConvexYieldWrapper
 *
 * Expects the Timelock to have ROOT permissions on the ConvexWrapper.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateConvexWrapperProposal = async (
  deployer: string,
  convexYieldWrapper: ConvexYieldWrapper,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('grantRole', [
      id(convexYieldWrapper.interface, 'point(address)'),
      timelock.address,
    ]),
  })
  console.log(`convexYieldWrapper.grantRole(point, timelock)`)

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`convexYieldWrapper.grantRole(ROOT, cloak)`)

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`convexYieldWrapper.revokeRole(ROOT, deployer)`)

  return proposal
}
