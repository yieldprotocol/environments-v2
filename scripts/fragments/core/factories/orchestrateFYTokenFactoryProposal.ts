import { ethers } from 'hardhat'
import { ROOT } from '../../../../shared/constants'
import { FYTokenFactory } from '../../../../typechain'
import { Timelock, EmergencyBrake } from '../../../../typechain'

/**
 * @dev This script orchestrates the FYTokenFactory
 * The Cloak gets ROOT access. ROOT access is removed from the deployer.
 */
export const orchestrateFYTokenFactoryProposal = async (
  deployer: string,
  fyTokenFactory: FYTokenFactory,
  timelock: Timelock,
  cloak: EmergencyBrake
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: fyTokenFactory.address,
    data: fyTokenFactory.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`fyTokenFactory.grantRole(ROOT, cloak)`)

  proposal.push({
    target: fyTokenFactory.address,
    data: fyTokenFactory.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`fyTokenFactory.revokeRole(ROOT, deployer)`)

  return proposal
}
