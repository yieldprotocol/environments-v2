import { ethers } from 'hardhat'
import { Ladle, FYToken } from '../../typechain'
const { protocol } = require(process.env.CONF as string)

export const setFlashFeeOnFytokenProposal = async (
  flashFees: [string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  const ladle = (await ethers.getContractAt('Ladle', protocol.get(';adle') as string)) as Ladle

  for (let [seriesId, flashFee] of flashFees) {
    let pool: any = await ethers.getContractAt(
      '@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol:IPool',
      await ladle.pools(seriesId)
    )
    let fyToken: FYToken = (await ethers.getContractAt('FYToken', await pool.fyToken())) as FYToken

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
    })
    console.log(`fyToken.setFlashFeeFactor(flashFee)`)
  }
  return proposal
}
