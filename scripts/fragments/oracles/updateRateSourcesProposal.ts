/**
 * @dev This script replaces one or more rate data sources in the CompoundMultiOracle.
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { RATE } from '../../../shared/constants'

import { CompoundMultiOracle } from '../../../typechain'

export const updateRateSourcesProposal = async (
  lendingOracle: CompoundMultiOracle,
  newSources: Array<[string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  const [ownerAcc] = await ethers.getSigners()
  console.log(`compoundOracle: ${lendingOracle.address}`)

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, sourceAddress] of newSources) {
    const cToken = await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      sourceAddress as string,
      ownerAcc
    )
    console.log(`Using ${await cToken.name()} at ${sourceAddress}`)
    proposal.push({
      target: lendingOracle.address,
      data: lendingOracle.interface.encodeFunctionData('setSource', [baseId, RATE, sourceAddress]),
    })
    console.log(`Rate(${bytesToString(baseId)}): ${sourceAddress}`)
  }

  return proposal
}
