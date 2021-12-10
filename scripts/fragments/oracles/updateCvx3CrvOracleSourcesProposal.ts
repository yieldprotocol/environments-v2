/**
 * @dev This script replaces one or more data sources in a Cvx3CrvOracle.
 */

import { ethers } from 'hardhat'

import { Cvx3CrvOracle } from '../../../typechain/Cvx3CrvOracle'
import { DAI,CVX3CRV,ETH } from '../../../shared/constants'

export const updateCvx3CrvOracleSourcesProposal = async (
  oracle: Cvx3CrvOracle,
  source: [string, string, string, string, string, string]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  
  if ((await ethers.provider.getCode(oracle.address)) === '0x') throw `Address ${oracle.address} contains no code`
  console.log(`Setting up the source for ${CVX3CRV}/${ETH} at ${oracle.address}`)

  proposal.push({
    target: oracle.address,
    data: oracle.interface.encodeFunctionData('setSource', source),
  })

  return proposal
}
