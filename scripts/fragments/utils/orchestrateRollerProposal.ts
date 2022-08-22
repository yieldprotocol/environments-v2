import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
import { Strategy, Roller, EmergencyBrake, Timelock } from '../../../typechain'

/**
 * @dev This script permissions a Roller
 *
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets permission to roll.
 */

export const orchestrateRollerProposal = async (
  deployer: string,
  strategies: Map<string, string>,
  roller: Roller,
  timelock: Timelock,
  cloak: EmergencyBrake,
  rollData: Array<[string, string, BigNumber, string, boolean]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: roller.address,
    data: roller.interface.encodeFunctionData('grantRoles', [
      [id(roller.interface, 'roll(address,uint256,address,address)')],
      timelock.address,
    ]),
  })
  console.log(`roller.grantRoles(roll, timelock)`)

  proposal.push({
    target: roller.address,
    data: roller.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`roller.grantRole(ROOT, cloak)`)

  for (let [symbol] of rollData) {
    const strategy = (await ethers.getContractAt('Strategy', strategies.get(symbol) as string)) as Strategy

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('grantRoles', [
        [id(strategy.interface, 'startPool(uint256,uint256)')],
        roller.address,
      ]),
    })
    console.log(`strategy(${symbol}).grantRoles(startPool, roller)`)
  }

  proposal.push({
    target: roller.address,
    data: roller.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`roller.revokeRole(ROOT, deployer)`)

  return proposal
}
