import { ROOT } from '../../../shared/constants'
import { NotionalMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

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
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_NOTIONAL_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: notionalOracle.address,
    data: notionalOracle.interface.encodeFunctionData('grantRoles', [
      [id(notionalOracle.interface, 'setSource(bytes6,bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `notionalOracle.grantRoles(gov, timelock)`))

  proposal.push({
    target: notionalOracle.address,
    data: notionalOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `notionalOracle.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(notionalOracle, deployer, nesting + 1))

  return proposal
}
