import { ethers } from 'hardhat'
import { Ladle } from '../../../typechain'

export const addToken = async (
  ladle: Ladle,
  token: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ADD_TOKEN`)
  if ((await ethers.provider.getCode(token)) === '0x') throw `Address ${token} contains no code`

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addToken', [token, true]),
  })
  console.log(`${'  '.repeat(nesting)}addToken ${token}`)

  return proposal
}
