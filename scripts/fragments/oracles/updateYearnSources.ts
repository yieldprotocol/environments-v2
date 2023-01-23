/**
 * @dev This script replaces one or more data sources in a YearnVaultMultiOracle.
 */

import { ethers } from 'hardhat'

import { YearnVaultMultiOracle } from '../../../typechain'

export const updateYearnSources = async (
  oracle: YearnVaultMultiOracle,
  sources: [string, string, string][],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, yearnVaultId, yvTokenAddress] of sources) {
    if ((await ethers.provider.getCode(yvTokenAddress)) === '0x') throw `Address ${yvTokenAddress} contains no code`
    console.log(`Setting up ${yvTokenAddress} as the source for ${baseId}/${yearnVaultId} at ${oracle.address}`)

    // TODO: We can now instantiate sourceAddress into a yvToken and read the price feed, which would be a better test

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [baseId, yearnVaultId, yvTokenAddress]),
    })
  }

  return proposal
}
