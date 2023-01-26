// Add an existing ilk to a series

import { Cauldron } from '../../../typechain'
import { Ilk, Series } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const addIlkToSeries = async (
  cauldron: Cauldron,
  series: Series,
  ilk: Ilk,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_ILK_TO_SERIES`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addIlks', [series.seriesId, [ilk.ilkId]]),
  })
  console.log(indent(nesting, `addIlks ${getName(series.seriesId)}: ${getName(ilk.ilkId)}`))

  return proposal
}
