/**
 * @dev This script registers one fyToken with the ladle.
 */

import { id } from '@yield-protocol/utils-v2'
import { Ladle, FYToken, EmergencyBrake } from '../../../typechain'
import { getName } from '../../../shared/helpers'
import { addToken } from './addToken'

export const addFYToken = async (
  cloak: EmergencyBrake,
  ladle: Ladle,
  seriesId: string,
  fyToken: FYToken,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ADD_FYTOKEN_TO_LADLE`)
  let proposal: Array<{ target: string; data: string }> = []

  // Allow the ladle to issue and cancel fyToken
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('grantRoles', [
      [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      ladle.address,
    ]),
  })
  console.log(`${'  '.repeat(nesting)}Added ${getName(seriesId)} fyToken to Ladle using ${fyToken.address}`)

  // Add ladle/fyToken orchestration to cloak
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      ladle.address,
      [
        {
          host: fyToken.address,
          signature: id(fyToken.interface, 'mint(address,uint256)'),
        },
        {
          host: fyToken.address,
          signature: id(fyToken.interface, 'burn(address,uint256)'),
        },
      ],
    ]),
  })
  console.log(`${'  '.repeat(nesting)}cloak.add(ladle mint and burn ${getName(seriesId)})`)

  // Register fyToken in Ladle
  proposal = proposal.concat(await addToken(ladle, fyToken.address, nesting + 1))

  return proposal
}
