/**
 * @dev This script replaces one or more data sources in a Cvx3CrvOracle.
 */

import { ethers } from 'hardhat'

import { Cvx3CrvOracle } from '../../../typechain'
import { CVX3CRV, ETH } from '../../../shared/constants'

export const updateCvx3CrvOracleSources = async (
  oracle: Cvx3CrvOracle,
  source: [string, string, string, string, string, string],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}UPDATE_CVX3CRV_ORACLE_SOURCES`)
  const proposal: Array<{ target: string; data: string }> = []

  if ((await ethers.provider.getCode(oracle.address)) === '0x') throw `Address ${oracle.address} contains no code`
  console.log(`${'  '.repeat(nesting)}Setting up the source for ${CVX3CRV}/${ETH} at ${oracle.address}`)

  proposal.push({
    target: oracle.address,
    data: oracle.interface.encodeFunctionData('setSource', source),
  })

  return proposal
}
