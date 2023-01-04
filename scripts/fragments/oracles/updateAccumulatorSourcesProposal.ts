/**
 * @dev This script replaces one or more chi data sources in the AccumulatorMultiOracle.
 */

import { getName } from '../../../shared/helpers'
import { AccumulatorMultiOracle } from '../../../typechain'

export const updateAccumulatorSourcesProposal = async (
  lendingOracle: AccumulatorMultiOracle,
  newSources: Array<[string, string, string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`compoundOracle: ${lendingOracle.address}`)

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let [baseId, kind, startRate, perSecondRate] of newSources) {
    const source = await lendingOracle.sources(baseId, kind)

    if (source.lastUpdated.isZero()) {
      proposal.push({
        target: lendingOracle.address,
        data: lendingOracle.interface.encodeFunctionData('setSource', [baseId, kind, startRate, perSecondRate]),
      })
      console.log(`Accumulator(${getName(baseId)}/${kind}): ${startRate}, ${perSecondRate}`)
    } else {
      console.log(`Accumulator for (${getName(baseId)}/${kind}): already set`)
    }
  }

  return proposal
}
