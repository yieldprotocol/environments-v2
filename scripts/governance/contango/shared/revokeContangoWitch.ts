/**
 * @dev This script revokes permissions to a witch
 */

import { id } from '@yield-protocol/utils-v2'
import { Cauldron, ContangoWitch } from '../../../../typechain'

export const revokeContangoWitch = async (
  witch: ContangoWitch,
  cauldron: Cauldron,
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRoles', [
      [id(cauldron.interface, 'give(bytes12,address)'), id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')],
      witch.address,
    ]),
  })
  console.log(`cauldron.revokeRoles(witch ${witch.address})`)

  return proposal
}
