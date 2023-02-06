/**
 * @dev This script orchestrates Witch V2
 */

import { id } from '@yield-protocol/utils-v2'
import { Cauldron, EmergencyBrake, Timelock, Witch } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const orchestrateWitchToCauldron = async (
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_WITCH_TO_CAULDRON`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [id(cauldron.interface, 'give(bytes12,address)'), id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')],
      witch.address,
    ]),
  })
  console.log(indent(nesting, `cauldron.grantRoles(witch)`))

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      witch.address,
      [
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'give(bytes12,address)'),
        },
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'slurp(bytes12,uint128,uint128)'),
        },
      ],
    ]),
  })
  console.log(indent(nesting, `cloak.add(witch give and slurp)`))

  return proposal
}
