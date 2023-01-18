/**
 * @dev This script registers one fyToken with the ladle.
 */

import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../shared/helpers'
import { Witch, FYToken, EmergencyBrake } from '../../../typechain'

export const addFYTokenToWitch = async (
  cloak: EmergencyBrake,
  witch: Witch,
  seriesId: string,
  fyToken: FYToken
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  // Allow the witch to burn fyToken
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('grantRoles', [
      [id(fyToken.interface, 'burn(address,uint256)')],
      witch.address,
    ]),
  })

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      witch.address,
      [
        {
          host: fyToken.address,
          signature: id(fyToken.interface, 'burn(address,uint256)'),
        },
      ],
    ]),
  })
  console.log(`cloak.add(witch burn ${getName(seriesId)})`)

  return proposal
}
