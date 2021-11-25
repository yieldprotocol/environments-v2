import { ethers } from 'hardhat'
import { ROOT } from '../../../../shared/constants'
import { JoinFactory } from '../../../../typechain'
import { Timelock, EmergencyBrake } from '../../../../typechain'

/**
 * @dev This script orchestrates the JoinFactory
 * The Cloak gets ROOT access. ROOT access is removed from the deployer.
 */
export const orchestrateJoinFactoryProposal = async (
  deployer: string,
  joinFactory: JoinFactory,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: joinFactory.address,
    data: joinFactory.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`joinFactory.grantRole(ROOT, cloak)`)

  proposal.push({
    target: joinFactory.address,
    data: joinFactory.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`joinFactory.revokeRole(ROOT, deployer)`)

  return proposal
}
