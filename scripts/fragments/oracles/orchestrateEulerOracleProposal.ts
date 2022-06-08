import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { EmergencyBrake, ETokenMultiOracle, Timelock } from '../../../typechain'

/**
 * @dev This script permissions a ETokenMultiOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateEulerOracleProposal = async (
  deployer: string,
  eulerOracle: ETokenMultiOracle,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: eulerOracle.address,
    data: eulerOracle.interface.encodeFunctionData('grantRoles', [
      [id(eulerOracle.interface, 'setSource(bytes6,bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(`eulerOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: eulerOracle.address,
    data: eulerOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`eulerOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: eulerOracle.address,
    data: eulerOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`eulerOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
