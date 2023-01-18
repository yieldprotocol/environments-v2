import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../../shared/helpers'
import { addJoin } from '../../ladle/addJoin'

import { EmergencyBrake, Join__factory, Ladle, NotionalJoin } from '../../../../typechain'

export const addNotionalJoin = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  ladle: Ladle,
  assetId: string,
  join: NotionalJoin
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  const underlyingJoin = Join__factory.connect(await join.underlyingJoin(), ownerAcc)

  if (
    !(
      (await underlyingJoin.hasRole(id(underlyingJoin.interface, 'join(address,uint128)'), join.address)) ||
      (await underlyingJoin.hasRole(id(underlyingJoin.interface, 'exit(address,uint128)'), join.address))
    )
  ) {
    proposal.push({
      target: underlyingJoin.address,
      data: underlyingJoin.interface.encodeFunctionData('grantRoles', [
        [id(underlyingJoin.interface, 'join(address,uint128)'), id(underlyingJoin.interface, 'exit(address,uint128)')],
        join.address,
      ]),
    })
    console.log(`underlyingJoin.grantRoles(join/exit, join)`)

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('add', [
        join.address,
        [
          {
            host: underlyingJoin.address,
            signature: id(join.interface, 'join(address,uint128)'),
          },
          {
            host: underlyingJoin.address,
            signature: id(join.interface, 'exit(address,uint128)'),
          },
        ],
      ]),
    })
    console.log(`cloak.add(join to underlying join for ${getName(assetId)})`)
  }

  proposal = proposal.concat(await addJoin(cloak, ladle, assetId, Join__factory.connect(join.address, join.signer)))

  return proposal
}
