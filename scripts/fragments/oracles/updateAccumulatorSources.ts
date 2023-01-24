/**
 * @dev This script replaces one or more chi data sources in the AccumulatorMultiOracle.
 */

import { getName, indent } from '../../../shared/helpers'
import { AccumulatorMultiOracle } from '../../../typechain'
import { Accumulator } from '../../governance/confTypes'

export const updateAccumulatorSources = async (
  accumulatorOracle: AccumulatorMultiOracle,
  accumulators: Accumulator[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_ACCUMULATOR_SOURCES`))
  console.log(indent(nesting, `accumulator oracle: ${accumulatorOracle.address}`))

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let accumulator of accumulators) {
    const source = await accumulatorOracle.sources(accumulator.baseId, accumulator.kind)

    if (source.lastUpdated.isZero()) {
      proposal.push({
        target: accumulatorOracle.address,
        data: accumulatorOracle.interface.encodeFunctionData('setSource', [
          accumulator.baseId,
          accumulator.kind,
          accumulator.startRate,
          accumulator.perSecondRate,
        ]),
      })
      console.log(
        `Accumulator(${getName(accumulator.baseId)}/${getName(accumulator.kind)}): ${accumulator.startRate}, ${
          accumulator.perSecondRate
        }`
      )
    } else {
      console.log(
        `${'  '.repeat(nesting)}Accumulator for (${getName(accumulator.baseId)}/${getName(
          accumulator.kind
        )}): already set`
      )
    }
  }

  return proposal
}
