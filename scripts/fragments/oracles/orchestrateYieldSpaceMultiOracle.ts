import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, YieldSpaceMultiOracle } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent } from '../../../shared/helpers'

/**
 * @dev This script permissions a YieldSpaceMultiOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateYieldSpaceMultiOracle = async (
  deployer: string,
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  timelock: Timelock,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_YIELDSPACE_MULTI_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: yieldSpaceMultiOracle.address,
    data: yieldSpaceMultiOracle.interface.encodeFunctionData('grantRoles', [
      [id(yieldSpaceMultiOracle.interface, 'setSource(bytes6,bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `yieldSpaceMultiOracle.grantRoles(gov, timelock)`))

  proposal = proposal.concat(await revokeRoot(yieldSpaceMultiOracle, deployer, nesting + 1))

  return proposal
}
