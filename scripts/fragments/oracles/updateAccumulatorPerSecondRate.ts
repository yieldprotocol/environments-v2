/**
 * @dev This script replaces one or more chi data sources in the AccumulatorMultiOracle.
 */

import { getName, indent, bytes6ToBytes32 } from '../../../shared/helpers'
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

  // The accumulator needs to be updated in the same block as its per second rate
  proposal.push({
    target: accumulatorOracle.address,
    data: accumulatorOracle.interface.encodeFunctionData('get', [
      bytes6ToBytes32(accumulator.baseId),
      bytes6ToBytes32(accumulator.kind),
      0,
    ]),
  })

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
