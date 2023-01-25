import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, ConvexYieldWrapper } from '../../../typechain'
import { indent } from '../../../shared/helpers'

/**
 * @dev This script permissions the ConvexYieldWrapper
 *
 * Expects the Timelock to have ROOT permissions on the ConvexWrapper.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateConvexWrapper = async (
  deployer: string,
  convexYieldWrapper: ConvexYieldWrapper,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_CONVEX_WRAPPER`))
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
  console.log(indent(nesting, `convexYieldWrapper.grantRole(point, timelock)`))

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('grantRole', [
      id(convexYieldWrapper.interface, 'recoverERC20(address,uint256,address)'),
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `convexYieldWrapper.grantRole(recoverERC20, timelock)`))

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('grantRole', [
      id(convexYieldWrapper.interface, 'shutdownAndRescue(address)'),
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `convexYieldWrapper.grantRole(shutdownAndRescue, timelock)`))

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `convexYieldWrapper.grantRole(ROOT, cloak)`))

  proposal.push({
    target: convexYieldWrapper.address,
    data: convexYieldWrapper.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(indent(nesting, `convexYieldWrapper.revokeRole(ROOT, deployer)`))

  return proposal
}
