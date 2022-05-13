/**
 * @dev This script registers a module with the Ladle.
 */

import { ethers } from 'hardhat'

import { Ladle } from '../../../typechain'

export const orchestrateModuleProposal = async (
  ladle: Ladle,
  moduleAddress: string
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  if ((await ethers.provider.getCode(moduleAddress)) === '0x') throw `Address ${moduleAddress} contains no code`

  // Register the module in the Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addModule', [moduleAddress, true]),
  })

  console.log(`Adding module ${moduleAddress} to Ladle`)

  return proposal
}
