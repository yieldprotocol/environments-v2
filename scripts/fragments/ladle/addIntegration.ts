import { ethers } from 'hardhat'
import { Ladle } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const addIntegration = async (
  ladle: Ladle,
  integration: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_INTEGRATION`))
  if ((await ethers.provider.getCode(integration)) === '0x') throw `Address ${integration} contains no code`

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addIntegration', [integration, true]),
  })
  console.log(indent(nesting, `addIntegration ${integration}`))

  return proposal
}
