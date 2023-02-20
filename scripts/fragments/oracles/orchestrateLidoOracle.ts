import { ROOT } from '../../../shared/constants'
import { LidoOracle, EmergencyBrake, Timelock } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script permissions the LidoOracle
 *
 * Expects the Timelock to have ROOT permissions on the LidoOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateLidoOracle = async (
  deployer: string,
  lidoOracle: LidoOracle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_LIDO_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: lidoOracle.address,
    data: lidoOracle.interface.encodeFunctionData('grantRoles', [
      [id(lidoOracle.interface, 'setSource(address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `lidoOracle.grantRoles(gov, timelock)`))

  proposal.push({
    target: lidoOracle.address,
    data: lidoOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `lidoOracle.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(lidoOracle, deployer, nesting + 1))

  return proposal
}
