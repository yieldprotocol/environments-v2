/**
 * @dev This script registers one fyToken with the ladle.
 */

import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../shared/helpers'
import { Witch, Join, EmergencyBrake } from '../../../typechain'

export const addIlkToWitch = async (
  cloak: EmergencyBrake,
  witch: Witch,
  assetId: string,
  join: Join
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  // Allow Witch to exit ilk
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRole', [id(join.interface, 'exit(address,uint128)'), witch.address]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      witch.address,
      [
        {
          host: join.address,
          signature: id(join.interface, 'exit(address,uint128)'),
        },
      ],
    ]),
  })
  // TODO: Maybe check the assetId matches
  console.log(`cloak.add(witch exit ${getName(assetId)})`)

  return proposal
}
