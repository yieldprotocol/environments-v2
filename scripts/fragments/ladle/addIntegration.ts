import { ethers } from 'hardhat'
import { Ladle } from '../../../typechain'

export const addIntegration = async (
  ladle: Ladle,
  integration: string
): Promise<Array<{ target: string; data: string }>> => {
  if ((await ethers.provider.getCode(integration)) === '0x') throw `Address ${integration} contains no code`

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addIntegration', [integration, true]),
  })
  console.log(`addIntegration ${integration}`)

  return proposal
}
