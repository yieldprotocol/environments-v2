import { ROOT } from '../../../shared/constants'
import { AccumulatorMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script permissions a AccumulatorMultiOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateAccumulatorOracle = async (
  deployer: string,
  accumulatorOracle: AccumulatorMultiOracle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_ACCUMULATOR_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: accumulatorOracle.address,
    data: accumulatorOracle.interface.encodeFunctionData('grantRoles', [
      [id(accumulatorOracle.interface, 'setSource(bytes6,bytes6,uint256,uint256)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `accumulatorOracle.grantRoles(gov, timelock)`))

  proposal.push({
    target: accumulatorOracle.address,
    data: accumulatorOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `accumulatorOracle.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(accumulatorOracle, deployer, nesting + 1))

  return proposal
}
