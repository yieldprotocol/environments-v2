/**
 * @dev This script replaces one or more chi data sources in the AccumulatorMultiOracle.
 */

import { getName, indent } from '../../../shared/helpers'
import { AccumulatorMultiOracle } from '../../../typechain'
import { Accumulator } from '../../governance/confTypes'

export const updateAccumulatorPerSecondRate = async (
  accumulatorOracle: AccumulatorMultiOracle,
  accumulator: Accumulator,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_ACCUMULATOR_PER_SECOND_RATE`))
  console.log(indent(nesting, `accumulator oracle: ${accumulatorOracle.address}`))

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: accumulatorOracle.address,
    data: accumulatorOracle.interface.encodeFunctionData('updatePerSecondRate', [
      accumulator.baseId,
      accumulator.kind,
      accumulator.perSecondRate,
    ]),
  })
  console.log(
    indent(
      nesting,
      `Accumulator(${getName(accumulator.baseId)}/${getName(accumulator.kind)}): ${
        accumulator.perSecondRate
      }`
    )
  )

  return proposal
}
