import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { CrabOracle, EmergencyBrake, Timelock } from '../../../typechain'

/**
 * @dev This script permissions a CrabOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateCrabOracleProposal = async (
  deployer: string,
  crabOracle: CrabOracle,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: crabOracle.address,
    data: crabOracle.interface.encodeFunctionData('grantRoles', [
      [id(crabOracle.interface, 'setSource(bytes6,bytes6,address,address)')],
      timelock.address,
    ]),
  })
  console.log(`crabOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: crabOracle.address,
    data: crabOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`crabOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: crabOracle.address,
    data: crabOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`crabOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
