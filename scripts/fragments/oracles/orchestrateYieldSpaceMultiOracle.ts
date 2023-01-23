import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Timelock, YieldSpaceMultiOracle } from '../../../typechain'

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
  console.log(`\n${'  '.repeat(nesting)}ORCHESTRATE_YIELDSPACE_MULTI_ORACLE`)
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: yieldSpaceMultiOracle.address,
    data: yieldSpaceMultiOracle.interface.encodeFunctionData('grantRoles', [
      [id(yieldSpaceMultiOracle.interface, 'setSource(bytes6,bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(`${'  '.repeat(nesting)}yieldSpaceMultiOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: yieldSpaceMultiOracle.address,
    data: yieldSpaceMultiOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`${'  '.repeat(nesting)}yieldSpaceMultiOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
