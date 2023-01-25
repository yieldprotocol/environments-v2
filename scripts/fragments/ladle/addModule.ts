import { ethers } from 'hardhat'
import { Ladle } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const addModule = async (
  ladle: Ladle,
  module: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_MODULE`))
  if ((await ethers.provider.getCode(module)) === '0x') throw `Address ${module} contains no code`

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addModule', [module, true]),
  })
  console.log(indent(nesting, `addmodule ${module}`))

  return proposal
}
