import { ethers } from 'hardhat'

import { ChainlinkUSDMultiOracle } from '../../../typechain'

export const updateChainlinkUSDSourcesProposal = async (
  oracle: ChainlinkUSDMultiOracle,
  spotSources: [string, string, string][]
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, baseAddress, sourceAddress] of spotSources) {
    if ((await ethers.provider.getCode(sourceAddress)) === '0x') throw `Address ${sourceAddress} contains no code`
    console.log(`Setting up ${sourceAddress} as the source for ${baseId}/USD at ${oracle.address}`)

    // TODO: We can now instantiate sourceAddress into a ChainlinkV3Aggregator and read the price feed, which would be a better test

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [
        baseId,
        baseAddress,
        sourceAddress,
      ]),
    })
  }

  return proposal
}