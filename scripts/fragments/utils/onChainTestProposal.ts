import { ethers } from 'hardhat'
import { stringToBytes32, stringToBytes6 } from '../../../shared/helpers'

import { Cauldron, OnChainTest } from '../../../typechain'

export const onChainTestProposal = async (
  cauldron: Cauldron,
  onChainTest: OnChainTest,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, assetAddress, joinAddress] of assets) {
    if ((await ethers.provider.getCode(assetAddress)) === '0x') throw `Address ${assetAddress} contains no code`

    //
    proposal.push({
      target: onChainTest.address,
      data: onChainTest.interface.encodeFunctionData('valueAndCallEquator', [
        cauldron.address,
        cauldron.interface.encodeFunctionData('assets', [assetId]),
        '0x000000000000000000000000' + assetAddress.slice(2, 63),
      ]),
    })
  }

  return proposal
}