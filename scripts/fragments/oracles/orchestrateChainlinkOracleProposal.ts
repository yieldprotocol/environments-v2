import { id } from '@yield-protocol/utils-v2'

import { ChainlinkMultiOracle, EmergencyBrake, Timelock } from '../../../typechain'

/**
 * @dev This script permissions a ChainlinkMultiOracle
 * 
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

export const orchestrateChainlinkOracleProposal = async (
    ownerAcc: any, 
    chainlinkOracle: ChainlinkMultiOracle,
    timelock: Timelock,
    cloak: EmergencyBrake
  ): Promise<Array<{ target: string; data: string }>>  => {
  const ROOT = await chainlinkOracle.ROOT()

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: chainlinkOracle.address,
    data: chainlinkOracle.interface.encodeFunctionData('grantRoles', [
        [id(chainlinkOracle.interface, 'setSource(bytes6,address,bytes6,address,address)')],
        timelock.address
    ])
  })
  console.log(`chainlinkOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: chainlinkOracle.address,
    data: chainlinkOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
  })
  console.log(`chainlinkOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: chainlinkOracle.address,
    data: chainlinkOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
  })
  console.log(`chainlinkOracle.revokeRole(ROOT, deployer)`)

  return proposal
}