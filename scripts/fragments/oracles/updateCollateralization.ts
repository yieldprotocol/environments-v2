// Update the collateralization configuration for an ilk

import { Cauldron } from '../../../typechain'
import { Ilk } from '../../governance/confTypes'

export const updateCollateralization = async (
  cauldron: Cauldron,
  ilk: Ilk
): Promise<Array<{ target: string; data: string }>> => {
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
    `Spot oracle for ${ilk.baseId}/${ilk.ilkId} set to ${ilk.collateralization.oracle} with ratio ${ilk.collateralization.ratio}`
  )

  return proposal
}
