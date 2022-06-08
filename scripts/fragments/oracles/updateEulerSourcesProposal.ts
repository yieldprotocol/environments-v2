/**
 * @dev This script replaces one or more data sources in a ETokenMultiOracle.
 */

import { ethers } from 'hardhat'

import { ETokenMultiOracle } from '../../../typechain'

export const updateEulerSourcesProposal = async (
  oracle: ETokenMultiOracle,
  sources: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [underlyingId, eTokenId, eTokenAddress] of sources) {
    if ((await ethers.provider.getCode(eTokenAddress)) === '0x') throw `Address ${eTokenAddress} contains no code`
    console.log(`Setting up ${eTokenAddress} as the source for ${underlyingId}/${eTokenId} at ${oracle.address}`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [underlyingId, eTokenId, eTokenAddress]),
    })
  }

  return proposal
}
