/**
 * @dev This script replaces one or more chi data sources in the CompoundMultiOracle.
 */

import { ethers } from 'hardhat'
import { getName, indent } from '../../../shared/helpers'
import { CHI } from '../../../shared/constants'

import { ERC20Mock, CompoundMultiOracle } from '../../../typechain'

export const updateChiSources = async (
  lendingOracle: CompoundMultiOracle,
  newSources: Array<[string, string]>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_CHI_SOURCES`))
  const [ownerAcc] = await ethers.getSigners()
  console.log(indent(nesting, `compoundOracle: ${lendingOracle.address}`))

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, sourceAddress] of newSources) {
    const cToken = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      sourceAddress as string,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(indent(nesting, `Using ${await cToken.name()} at ${sourceAddress}`))
    proposal.push({
      target: lendingOracle.address,
      data: lendingOracle.interface.encodeFunctionData('setSource', [baseId, CHI, sourceAddress]),
    })
    console.log(indent(nesting, `Chi(${getName(baseId)}): ${sourceAddress}`))
  }

  return proposal
}
