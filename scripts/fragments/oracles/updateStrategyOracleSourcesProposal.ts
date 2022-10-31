import { ethers } from 'hardhat'
import { StrategyOracle } from '../../../typechain'

export const updatStrategyOracleSourcesProposal = async (
  oracle: StrategyOracle,
  spotSources: [string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [strategyId, strategy] of spotSources) {
    if ((await ethers.provider.getCode(strategy)) === '0x') throw `Address ${strategy} contains no code`
    console.log(`Setting up ${strategy} as the source for ${strategyId} at ${oracle.address}`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [strategyId, strategy]),
    })
  }

  return proposal
}
