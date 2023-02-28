// Add an existing ilk to a series

import { VRCauldron } from '../../../typechain'
import { Ilk, Series } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const addVRIlk = async (
  cauldron: VRCauldron,
  ilk: Ilk,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_ILK_TO_SERIES`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addIlks', [ilk.baseId, [ilk.ilkId]]),
  })
  console.log(indent(nesting, `addIlks ${getName(ilk.baseId)}: ${getName(ilk.ilkId)}`))

  return proposal
}
