import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'

import { PoolFactory } from '../../../../typechain'
import { Timelock, EmergencyBrake } from '../../../../typechain'

/**
 * @dev This script orchestrates the PoolFactory
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */
export const orchestratePoolFactoryProposal = async (
  deployer: string,
  poolFactory: PoolFactory,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  const ROOT = await timelock.ROOT()

  proposal.push({
    target: poolFactory.address,
    data: poolFactory.interface.encodeFunctionData('grantRoles', [
      [id(poolFactory.interface, 'setParameter(bytes32,int128)')],
      timelock.address,
    ]),
  })
  console.log(`poolFactory.grantRoles(gov, timelock)`)

  proposal.push({
    target: poolFactory.address,
    data: poolFactory.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`poolFactory.grantRole(ROOT, cloak)`)

  proposal.push({
    target: poolFactory.address,
    data: poolFactory.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`poolFactory.revokeRole(ROOT, deployer)`)

  return proposal
}
