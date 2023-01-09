// Add an existing ilk to a series

import { Cauldron } from '../../../typechain'
import { Ilk, Series } from '../../governance/confTypes'

export const addIlkToSeries = async (
  cauldron: Cauldron,
  series: Series,
  ilk: Ilk
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  console.log(`Updating ${series.seriesId} series with ${ilk.ilkId} ilk`)
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addIlks', [series.seriesId, [ilk.ilkId]]),
  })
  console.log(`addIlks ${series.seriesId}: ${ilk.ilkId}`)

  return proposal
}
