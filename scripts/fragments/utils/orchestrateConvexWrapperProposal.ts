import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, EmergencyBrake, ConvexStakingWrapperYield } from '../../../typechain'
/**
 * @dev This script permissions the ConvexStakingWrapperYield
 *
 * Expects the Timelock to have ROOT permissions on the ConvexWrapper.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateConvexWrapperProposal = async (
    deployer: string, 
    convexStakingWrapper: ConvexStakingWrapperYield,
    timelock: Timelock,
    cloak: EmergencyBrake
  ): Promise<Array<{ target: string; data: string }>>  => {

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
      target: convexStakingWrapper.address,
      data: convexStakingWrapper.interface.encodeFunctionData('grantRole', [id(convexStakingWrapper.interface, 'point(address)'),timelock.address])
  })
  console.log(`convexStakingWrapper.grantRole(point, timelock)`)

  proposal.push({
      target: convexStakingWrapper.address,
      data: convexStakingWrapper.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`convexStakingWrapper.grantRole(ROOT, cloak)`)

  proposal.push({
      target: convexStakingWrapper.address,
      data: convexStakingWrapper.interface.encodeFunctionData('revokeRole', [ROOT, deployer])
  })
  console.log(`convexStakingWrapper.revokeRole(ROOT, deployer)`)

  return proposal
}