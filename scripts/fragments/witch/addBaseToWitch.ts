/**
 * @dev This script registers one fyToken with the ladle.
 */

import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../shared/helpers'
import { Witch, Join, EmergencyBrake } from '../../../typechain'

export const addBaseToWitch = async (
  cloak: EmergencyBrake,
  witch: Witch,
  assetId: string,
  join: Join,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  // Allow Witch to join base
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRole', [id(join.interface, 'join(address,uint128)'), witch.address]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      witch.address,
      [
        {
          host: join.address,
          signature: id(join.interface, 'join(address,uint128)'),
        },
      ],
    ]),
  })
  // TODO: Maybe check the assetId matches
  console.log(`${'  '.repeat(nesting)}cloak.add(witch join ${getName(assetId)})`)

  return proposal
}
