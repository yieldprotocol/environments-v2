/**
 * @dev This script replaces one or more chi data sources in the AccumulatorMultiOracle.
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { AccumulatorMultiOracle } from '../../../typechain'

export const updateAccumulatorSourcesProposal = async (
  lendingOracle: AccumulatorMultiOracle,
  newSources: Array<[string, string, string, string]>
): Promise<Array<{ target: string; data: string }>>  => {
  const [ ownerAcc ] = await ethers.getSigners()
  console.log(`compoundOracle: ${lendingOracle.address}`)

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, kind, startRate, perSecondRate] of newSources) {
    proposal.push({
      target: lendingOracle.address,
      data: lendingOracle.interface.encodeFunctionData('setSource', [baseId, kind, startRate, perSecondRate]),
    })
    console.log(`Accumulator(${bytesToString(baseId)}/${kind}): ${startRate}, ${perSecondRate}`)
  }

  return proposal
}
