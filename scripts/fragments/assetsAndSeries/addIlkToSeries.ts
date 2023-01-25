// Add an existing ilk to a series

import { Cauldron } from '../../../typechain'
import { Ilk, Series } from '../../governance/confTypes'
import { getName } from '../../../shared/helpers'

export const addIlkToSeries = async (
  cauldron: Cauldron,
  series: Series,
  ilk: Ilk
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addIlks', [series.seriesId, [ilk.ilkId]]),
  })
  console.log(`addIlks ${getName(series.seriesId)}: ${getName(ilk.ilkId)}`)

  return proposal
}
