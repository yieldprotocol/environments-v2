/**
 * @dev This script removes one or more joins with the ladle.
 */

import { id } from '@yield-protocol/utils-v2'
import { ZERO_ADDRESS } from '../../../shared/constants'

import { Ladle, EmergencyBrake, Join__factory } from '../../../typechain'

export const removeJoinProposal = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  ladle: Ladle,
  assetId: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  const joinAddress = await ladle.joins(assetId)
  if (joinAddress === undefined || joinAddress === ZERO_ADDRESS) throw `Join for ${assetId} not found`
  else console.log(`${'  '.repeat(nesting)}Using join at ${joinAddress} for ${assetId}`)
  const join = Join__factory.connect(joinAddress, ownerAcc)

  // Disallow Ladle to join and exit on the asset Join
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('revokeRoles', [
      [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      ladle.address,
    ]),
  })

  // Remove orchestration from cloak
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('remove', [
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
  console.log(`${'  '.repeat(nesting)}cloak.remove(ladle join and exit ${assetId})`)

  // Remove join in Ladle - CAN'T BE DONE BECAUSE OF BUG IN LADLE
  // proposal.push({
  //   target: ladle.address,
  //   data: ladle.interface.encodeFunctionData('addJoin', [assetId, ZERO_ADDRESS]),
  // })
  // console.log(`${'  '.repeat(nesting)}Adding ${assetId} join to Ladle using ${join.address}`)

  return proposal
}
