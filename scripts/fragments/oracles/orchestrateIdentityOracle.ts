import { ROOT } from '../../../shared/constants'
import { IdentityOracle, EmergencyBrake, Timelock } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script permissions a IdentityOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateIdentityOracle = async (
  deployer: string,
  identityOracle: IdentityOracle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_IDENTITY_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: identityOracle.address,
    data: identityOracle.interface.encodeFunctionData('grantRoles', [
      [id(identityOracle.interface, 'setSource(bytes6,bytes6,address,address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `identityOracle.grantRoles(gov, timelock)`))

  proposal.push({
    target: identityOracle.address,
    data: identityOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `identityOracle.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(identityOracle, deployer, nesting + 1))

  return proposal
}
