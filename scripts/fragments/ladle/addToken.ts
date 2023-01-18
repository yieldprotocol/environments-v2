import { ethers } from 'hardhat'
import { Ladle } from '../../../typechain'

export const addToken = async (ladle: Ladle, token: string): Promise<Array<{ target: string; data: string }>> => {
  if ((await ethers.provider.getCode(token)) === '0x') throw `Address ${token} contains no code`

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addToken', [token, true]),
  })
  console.log(`addToken ${token}`)

  return proposal
}
