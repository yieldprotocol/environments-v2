import { indent, getName } from '../../../shared/helpers'

import { Cauldron } from '../../../typechain'

export const updateRateOracle = async (
  cauldron: Cauldron,
  assetId: string,
  oracle: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_RATE_ORACLE`))

  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setLendingOracle', [assetId, oracle]),
  })

  console.log(indent(nesting, `Rate oracle updated: ${getName(assetId)}: ${oracle}`))
  return proposal
}
