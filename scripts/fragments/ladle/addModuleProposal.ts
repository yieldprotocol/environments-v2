import { ethers } from 'hardhat'
import { Ladle } from '../../../typechain'

export const addModuleProposal = async (
  ladle: Ladle,
  module: string,
): Promise<Array<{ target: string; data: string }>>  => {
  if ((await ethers.provider.getCode(module)) === '0x') throw `Address ${module} contains no code`

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addModule', [module, true]),
  })
  console.log(`addmodule ${module}`)

  return proposal
}