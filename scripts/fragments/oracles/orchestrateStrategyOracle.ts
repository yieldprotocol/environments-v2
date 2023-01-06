import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { StrategyOracle } from '../../../typechain'
import { EmergencyBrake } from '../../../typechain'
import { Timelock } from '../../../typechain'

/**
 * @dev This script permissions the StrategyOracle
 *
 * Expects the Timelock to have ROOT permissions on the StrategyOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateStrategyOracle = async (
  deployer: string,
  strategyOracle: StrategyOracle,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: strategyOracle.address,
    data: strategyOracle.interface.encodeFunctionData('grantRoles', [
      [id(strategyOracle.interface, 'setSource(bytes6,address)')],
      timelock.address,
    ]),
  })
  console.log(`strategyOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: strategyOracle.address,
    data: strategyOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`strategyOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: strategyOracle.address,
    data: strategyOracle.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`strategyOracle.revokeRole(ROOT, deployer)`)

  return proposal
}
