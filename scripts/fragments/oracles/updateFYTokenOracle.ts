import { indent } from '../../../shared/helpers'
import { ORACLE_PARAM } from '../../../shared/constants'

import { FYToken } from '../../../typechain'

export const updateFYTokenOracle = async (
  fyToken: FYToken,
  oracle: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_FYTOKEN_ORACLE`))

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('point', [ORACLE_PARAM, oracle]),
  })

  console.log(indent(nesting, `oracle updated: ${await fyToken.symbol()}: ${oracle}`))
  return proposal
}
