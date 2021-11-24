/**
 * @dev This script replaces one or more chi data sources in the CompoundMultiOracle.
 *
 * It takes as inputs the governance, protocol and chiSources json address files.
 * It rewrites the chiSources json address file.
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { RATE } from '../../../shared/constants'

import { ERC20Mock, CompoundMultiOracle } from '../../../typechain'

export const updateRateSourceProposal = async (
  ownerAcc: any, 
  lendingOracle: CompoundMultiOracle,
  newSources: Array<[string, string]>
): Promise<Array<{ target: string; data: string }>>  => {
  console.log(`compoundOracle: ${lendingOracle.address}`)

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, sourceAddress] of newSources) {
    const cToken = (await ethers.getContractAt('ERC20Mock', sourceAddress as string, ownerAcc)) as unknown as ERC20Mock
    console.log(`Using ${await cToken.name()} at ${sourceAddress}`)
    proposal.push({
      target: lendingOracle.address,
      data: lendingOracle.interface.encodeFunctionData('setSource', [baseId, RATE, sourceAddress]),
    })
    console.log(`Rate(${bytesToString(baseId)}): ${sourceAddress}`)
  }

  return proposal
}
