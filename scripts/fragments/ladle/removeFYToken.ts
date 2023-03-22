/**
 * @dev This script removes one fyToken from the ladle.
 */

import { Ladle, FYToken, EmergencyBrake } from '../../../typechain'
import { getName, indent, id } from '../../../shared/helpers'

export const removeFYToken = async (
  cloak: EmergencyBrake,
  ladle: Ladle,
  seriesId: string,
  fyToken: FYToken,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_FYTOKEN_TO_LADLE`))
  let proposal: Array<{ target: string; data: string }> = []

  // Disallow the ladle to issue and cancel fyToken
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('revokeRoles', [
      [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      ladle.address,
    ]),
  })
  console.log(indent(nesting, `Removed ${getName(seriesId)} fyToken from Ladle using ${fyToken.address}`))

  // Remove ladle/fyToken orchestration from cloak
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('remove', [
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
  console.log(indent(nesting, `cloak.remove(ladle mint and burn ${getName(seriesId)})`))

  // Registering fyToken in Ladle happens as part of the addPool call
  // proposal = proposal.concat(await addToken(ladle, fyToken.address, nesting + 1))

  return proposal
}
