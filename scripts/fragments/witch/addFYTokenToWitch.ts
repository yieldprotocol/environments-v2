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
  fyToken: FYToken,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ADD_FYTOKEN_TO_WITCH`)
  let proposal: Array<{ target: string; data: string }> = []

  // Allow the witch to burn fyToken
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('grantRoles', [
      [id(fyToken.interface, 'burn(address,uint256)')],
      witch.address,
    ]),
  })
  console.log(`${'  '.repeat(nesting)}Added ${getName(seriesId)} to Witch`)

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
  console.log(`${'  '.repeat(nesting)}cloak.add(witch burn ${getName(seriesId)})`)

  return proposal
}
