import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { ChainlinkUSDMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'

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
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('grantRoles', [
      [id(chainlinkUSDOracle.interface, 'setSource(bytes6,address,address)')],
      timelock.address,
    ]),
  })
  console.log(`${'  '.repeat(nesting)}chainlinkUSDOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`${'  '.repeat(nesting)}chainlinkUSDOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`${'  '.repeat(nesting)}chainlinkUSDOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
