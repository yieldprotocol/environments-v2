/**
 * @dev This script replaces one or more data sources in a NotionalMultiOracle.
 */

import { ethers } from 'hardhat'

import { NotionalMultiOracle } from '../../../typechain'

export const updateNotionalSourcesProposal = async (
  oracle: NotionalMultiOracle,
  sources: [string, string, string, string][] // fcash, notionalId, underlyingId, underlying
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let [fcashAddress, notionalId, underlyingId, underlyingAddress] of sources) {
    if ((await ethers.provider.getCode(fcashAddress)) === '0x') throw `Address ${fcashAddress} contains no code`
    if ((await ethers.provider.getCode(underlyingAddress)) === '0x')
      throw `Address ${underlyingAddress} contains no code`
    console.log(`Setting up ${fcashAddress} as the source for ${notionalId}/${underlyingId} at ${oracle.address}`)

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [notionalId, underlyingId, underlyingAddress]),
    })
  }

  return proposal
}
