/**
 * @dev This script registers one join with the ladle.
 */

import { id } from '@yield-protocol/utils-v2'
import { Ladle, Join, EmergencyBrake } from '../../../typechain'
import { getName } from '../../../shared/helpers'

export const addJoin = async (
  cloak: EmergencyBrake,
  ladle: Ladle,
  assetId: string,
  join: Join
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  // Allow Ladle to join and exit on the asset Join
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      ladle.address,
    ]),
  })

  // Add ladle/fyToken orchestration to cloak
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      ladle.address,
      [
        {
          host: join.address,
          signature: id(join.interface, 'join(address,uint128)'),
        },
        {
          host: join.address,
          signature: id(join.interface, 'exit(address,uint128)'),
        },
      ],
    ]),
  })
  console.log(`cloak.add(ladle join and exit ${getName(assetId)})`)

  // Register join in Ladle
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('addJoin', [assetId, join.address]),
  })
  console.log(`Adding ${getName(assetId)} join to Ladle using ${join.address}`)

  return proposal
}
