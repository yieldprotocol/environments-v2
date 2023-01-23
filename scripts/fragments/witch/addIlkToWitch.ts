/**
 * @dev This script registers one base and ilk pair in the Witch.
 * @notice Make sure you define auctionLineAndLimit in the ilk config.
 */

import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../shared/helpers'
import { Witch, Join, EmergencyBrake } from '../../../typechain'
import { setLineAndLimit } from '../witch/setLineAndLimit'
import { Ilk } from '../../governance/confTypes'

export const addIlkToWitch = async (
  cloak: EmergencyBrake,
  witch: Witch,
  ilk: Ilk,
  join: Join
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  // Make sure auctionLineAndLimit is defined.
  // If line and limit are set are already set, they will be updated
  proposal = proposal.concat(await setLineAndLimit(witch, ilk.auctionLineAndLimit!))

  if (!(await join.hasRole(id(join.interface, 'exit(address,uint128)'), witch.address))) {
    // Allow Witch to exit ilk
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [
        id(join.interface, 'exit(address,uint128)'),
        witch.address,
      ]),
    })
    console.log(`join(${getName(ilk.ilkId)}).grantRole(exit, witch)`)

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
    // TODO: Maybe check the ilk.ilkId matches
    console.log(`cloak.add(witch exit ${getName(ilk.ilkId)})`)
  } else {
    console.log(`Witch already has an exit role on join(${getName(ilk.ilkId)})`)
  }

  return proposal
}
