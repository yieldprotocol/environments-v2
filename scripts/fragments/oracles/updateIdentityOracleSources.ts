/**
 * @dev This script replaces one or more data sources in a IdentityOracle.
 */

import { IdentityOracle } from '../../../typechain'
import { OracleSource } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const updateIdentityOracleSources = async (
  oracle: IdentityOracle,
  sources: OracleSource[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_Identity_SOURCES`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let source of sources) {
    indent(
      nesting,
      `Setting up ${source.quoteAddress} as the source for ${getName(source.baseId)}/${getName(source.quoteId)} at ${
        oracle.address
      }`
    )

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [
        source.baseId,
        source.quoteId,
        source.baseAddress,
        source.quoteAddress,
      ]),
    })
  }

  return proposal
}
