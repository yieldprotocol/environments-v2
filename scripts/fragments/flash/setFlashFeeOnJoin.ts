import { ethers } from 'hardhat'
import { LADLE } from '../../../shared/constants'
import { Ladle, FlashJoin } from '../../../typechain'
const { protocol } = require(process.env.CONF as string)
import { indent } from '../../../shared/helpers'

export const setFlashFeeOnJoin = async (
  flashFees: [string, string][],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SET_FLASH_FEE_ON_JOIN`))
  let proposal: Array<{ target: string; data: string }> = []
  const ladle = (await ethers.getContractAt('Ladle', protocol().getOrThrow(LADLE) as string)) as Ladle

  for (let [assetId, flashFee] of flashFees) {
    const join = (await ethers.getContractAt('FlashJoin', await ladle.joins(assetId))) as unknown as FlashJoin

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
    })
    console.log(indent(nesting, `join.setFlashFeeFactor(flashFee)`))
  }
  return proposal
}
