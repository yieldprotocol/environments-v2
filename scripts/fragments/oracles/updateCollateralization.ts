// Update the collateralization configuration for an ilk

import { Cauldron } from '../../../typechain'
import { Ilk } from '../../governance/confTypes'
import { indent } from '../../../shared/helpers'

export const updateCollateralization = async (
  cauldron: Cauldron,
  ilk: Ilk,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_COLLATERALIZATION`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setSpotOracle', [
      ilk.baseId,
      ilk.ilkId,
      ilk.collateralization.oracle,
      ilk.collateralization.ratio,
    ]),
  })
  console.log(
    `${'  '.repeat(nesting)}Spot oracle for ${ilk.baseId}/${ilk.ilkId} set to ${
      ilk.collateralization.oracle
    } with ratio ${ilk.collateralization.ratio}`
  )

  return proposal
}
