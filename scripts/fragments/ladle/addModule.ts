import { ethers } from 'hardhat'
import { Ladle } from '../../../typechain'

export const addModule = async (
  ladle: Ladle,
  module: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  if ((await ethers.provider.getCode(module)) === '0x') throw `Address ${module} contains no code`

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addModule', [module, true]),
  })
  console.log(`${'  '.repeat(nesting)}addmodule ${module}`)

  return proposal
}
