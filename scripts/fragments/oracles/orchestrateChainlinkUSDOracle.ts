import { ROOT } from '../../../shared/constants'
import { ChainlinkUSDMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script permissions a ChainlinkUSDMultiOracle
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateChainlinkUSDOracle = async (
  deployer: string,
  chainlinkUSDOracle: ChainlinkUSDMultiOracle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_CHAINLINK_USD_ORACLE`))
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('grantRoles', [
      [id(chainlinkUSDOracle.interface, 'setSource(bytes6,address,address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `chainlinkUSDOracle.grantRoles(gov, timelock)`))

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `chainlinkUSDOracle.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(chainlinkUSDOracle, deployer, nesting + 1))

  return proposal
}
