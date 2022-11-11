import { ethers } from 'hardhat'
import { Cauldron, FlashJoin } from '../../typechain'
const { protocol } = require(process.env.CONF as string)

export const setFlashFeeOnJoinProposal = async (
  flashFees: [string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  const cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string)) as Cauldron
  for (let [assetId, flashFee] of flashFees) {
    const join = (await ethers.getContractAt('Join', await cauldron.assets(assetId))) as FlashJoin

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
    })
    console.log(`join.setFlashFeeFactor(flashFee)`)
  }
  return proposal
}
