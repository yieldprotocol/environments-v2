import { ethers } from 'hardhat'
import { LADLE } from '../../../shared/constants'
import { Ladle, FlashJoin } from '../../../typechain'
const { protocol } = require(process.env.CONF as string)

export const setFlashFeeOnJoin = async (
  flashFees: [string, string][],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  const ladle = (await ethers.getContractAt('Ladle', protocol().getOrThrow(LADLE) as string)) as Ladle

  for (let [assetId, flashFee] of flashFees) {
    const join = (await ethers.getContractAt('FlashJoin', await ladle.joins(assetId))) as unknown as FlashJoin

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
    })
    console.log(`${'  '.repeat(nesting)}join.setFlashFeeFactor(flashFee)`)
  }
  return proposal
}
