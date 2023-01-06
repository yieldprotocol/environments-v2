import { ethers } from 'hardhat'

import { ChainlinkUSDMultiOracle, AggregatorV3Interface } from '../../../typechain'

export const updateChainlinkUSDSources = async (
  oracle: ChainlinkUSDMultiOracle,
  spotSources: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, baseAddress, sourceAddress] of spotSources) {
    // TODO: Does the line below work in Arbitrum?
    if ((await ethers.provider.getCode(sourceAddress)) === '0x') throw `Address ${sourceAddress} contains no code`
    console.log(`Setting up ${sourceAddress} as the source for ${baseId}/USD at ${oracle.address}`)

    const aggregator = (await ethers.getContractAt(
      'AggregatorV3Interface',
      sourceAddress,
      (
        await ethers.getSigners()
      )[0]
    )) as unknown as AggregatorV3Interface
    console.log(`Aggregator decimals: ${await aggregator.decimals()}`)

    // TODO: We can now instantiate sourceAddress into a ChainlinkV3Aggregator and read the price feed, which would be a better test

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [baseId, baseAddress, sourceAddress]),
    })
  }

  return proposal
}
