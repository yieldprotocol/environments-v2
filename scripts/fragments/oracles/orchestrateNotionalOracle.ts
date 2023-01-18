import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { NotionalMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'

/**
 * @dev This script permissions a NotionalMultiOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateNotionalOracle = async (
  deployer: string,
  notionalOracle: NotionalMultiOracle,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: notionalOracle.address,
    data: notionalOracle.interface.encodeFunctionData('grantRoles', [
      [id(notionalOracle.interface, 'setSource(bytes6,bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(`notionalOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: notionalOracle.address,
    data: notionalOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`notionalOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: notionalOracle.address,
    data: notionalOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`notionalOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
