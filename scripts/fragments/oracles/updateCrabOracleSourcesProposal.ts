/**
 * @dev This script replaces one or more chi data sources in the CrabOracle.
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { CHI } from '../../../shared/constants'

import { ERC20Mock, CrabOracle } from '../../../typechain'

export const updateCrabOracleSourcesProposal = async (
  crabOracle: CrabOracle,
  source: [string, string, string, string]
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`crabOracle: ${crabOracle.address}`)

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: crabOracle.address,
    data: crabOracle.interface.encodeFunctionData('setSource', source),
  })

  return proposal
}
