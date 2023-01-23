/**
 * @dev This script registers one fyToken with the ladle.
 */

import { id } from '@yield-protocol/utils-v2'

import { addToken } from './addToken'
import { Ladle, FYToken, EmergencyBrake } from '../../../typechain'

export const addFYToken = async (
  cloak: EmergencyBrake,
  ladle: Ladle,
  seriesId: string,
  fyToken: FYToken
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  // Allow the ladle to issue and cancel fyToken
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('grantRoles', [
      [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      ladle.address,
    ]),
  })

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
  console.log(`cloak.add(ladle mint and burn ${seriesId})`)

  // Register fyToken in Ladle
  proposal = proposal.concat(await addToken(ladle, fyToken.address))

  return proposal
}
