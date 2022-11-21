import { ethers } from 'hardhat'
import { LADLE } from '../../shared/constants'
import { Ladle, FYToken, IPool } from '../../typechain'
const { protocol } = require(process.env.CONF as string)

export const setFlashFeeOnFytokenProposal = async (
  flashFees: [string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  const ladle = (await ethers.getContractAt('Ladle', protocol().getOrThrow(LADLE) as string)) as Ladle

  for (let [seriesId, flashFee] of flashFees) {
    let pool: any = (await ethers.getContractAt(
      '@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol:IPool',
      await ladle.pools(seriesId)
    )) as IPool

    let fyToken: FYToken = (await ethers.getContractAt('FYToken', await pool.fyToken())) as FYToken

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
    })
    console.log(`fyToken.setFlashFeeFactor(flashFee)`)
  }
  return proposal
}
