/**
 * @dev This script replaces one or more chi data sources in the AccumulatorMultiOracle.
 */

import { getName, indent } from '../../../shared/helpers'
import { VariableInterestRateOracle } from '../../../typechain'
import { VariableInterestRateOracleSource } from '../../governance/confTypes'

export const updateVariableInterestRateOracleSources = async (
  variableInterestRateOracle: VariableInterestRateOracle,
  sources: VariableInterestRateOracleSource[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_VARIABLE_INTEREST_RATE_ORACLE_SOURCES`))
  console.log(indent(nesting, `accumulator oracle: ${variableInterestRateOracle.address}`))

  // Build proposal
  const proposal: Array<{ target: string; data: string }> = []
  for (let item of sources) {
    const source = await variableInterestRateOracle.sources(item.baseId, item.kind)

    if (source.lastUpdated.isZero()) {
      proposal.push({
        target: variableInterestRateOracle.address,
        data: variableInterestRateOracle.interface.encodeFunctionData('updateParameters', [
          item.baseId,
          item.kind,
          item.optimalUsageRate,
          item.baseVariableBorrowRate,
          item.slope1,
          item.slope2,
        ]),
      })
      console.log(
        indent(
          nesting,
          `VariableInterestRateOracle(${getName(item.baseId)}/${getName(item.kind)}): ${item.optimalUsageRate}, ${
            item.accumulated
          },${item.baseVariableBorrowRate}, ${item.slope1}, ${item.slope2}, ${item.ilks}`
        )
      )
    } else {
      console.log(
        indent(nesting, `VariableInterestRateOracle(${getName(item.baseId)}/${getName(item.kind)}): already set`)
      )
    }
  }

  return proposal
}
