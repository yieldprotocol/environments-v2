import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { YearnVaultMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent } from '../../../shared/helpers'

/**
 * @dev This script permissions the YearnVaultMultiOracle
 *
 * Expects the Timelock to have ROOT permissions on the YearnVaultMultiOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateYearnOracle = async (
  deployer: string,
  yearnOracle: YearnVaultMultiOracle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_YEARN_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: yearnOracle.address,
    data: yearnOracle.interface.encodeFunctionData('grantRoles', [
      [id(yearnOracle.interface, 'setSource(bytes6,bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `yearnOracle.grantRoles(gov, timelock)`))

  proposal.push({
    target: yearnOracle.address,
    data: yearnOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `yearnOracle.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(yearnOracle, deployer, nesting + 1))

  return proposal
}
