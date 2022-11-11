import { ethers } from 'hardhat'
import { Ladle, FlashJoin } from '../../typechain'
const { protocol } = require(process.env.CONF as string)

export const setFlashFeeOnJoinProposal = async (
  flashFees: [string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string)) as Ladle

  for (let [assetId, flashFee] of flashFees) {
    const join = (await ethers.getContractAt('FlashJoin', await ladle.joins(assetId))) as unknown as FlashJoin

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
    })
    console.log(`join.setFlashFeeFactor(flashFee)`)
  }
  return proposal
}
