import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { CompoundMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'

/**
 * @dev This script permissions a CompoundMultiOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateCompoundOracle = async (
  deployer: string,
  compoundOracle: CompoundMultiOracle,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: compoundOracle.address,
    data: compoundOracle.interface.encodeFunctionData('grantRoles', [
      [id(compoundOracle.interface, 'setSource(bytes6,bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(`compoundOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: compoundOracle.address,
    data: compoundOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`compoundOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: compoundOracle.address,
    data: compoundOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`compoundOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
