import { ethers } from 'hardhat'
import { StrategyOracle } from '../../../typechain'

export const updatStrategyOracleSourcesProposal = async (
  oracle: StrategyOracle,
  spotSources: [string, string, number, string][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, quoteId, decimals, strategy] of spotSources) {
    if ((await ethers.provider.getCode(strategy)) === '0x') throw `Address ${strategy} contains no code`
    console.log(`Setting up ${strategy} as the source for ${baseId} at ${oracle.address}`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [baseId, quoteId, decimals, strategy]),
    })
  }

  return proposal
}
