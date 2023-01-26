import { id } from '@yield-protocol/utils-v2'

import { Cauldron, Ladle } from '../../../../../../typechain'

/**
 * @dev This script orchestrates the Ladle
 * The Ladle gets revoked the permission to give & stir functions in Cauldron
 */

export const removeLadlePermissionsProposal = async (
  cauldron: Cauldron,
  ladle: Ladle,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRoles', [
      [
        id(cauldron.interface, 'give(bytes12,address)'),
        id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
      ],
      ladle.address,
    ]),
  })
  console.log(`cauldron.revokeRoles(ladle)`)

  return proposal
}
