import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, Timelock, AccessControl__factory, FYToken, Join__factory } from '../../../typechain'
import { removeDeployer } from '../core/removeDeployer'
import { addAsHostToCloak } from '../cloak/addAsHostToCloak'
import { getName, indent } from '../../../shared/helpers'

export const orchestrateFYToken = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  fyToken: FYToken,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_FYTOKEN`))
  let proposal: Array<{ target: string; data: string }> = []

  const fyTokenAsAccessControl = AccessControl__factory.connect(fyToken.address, fyToken.signer)
  proposal = proposal.concat(await removeDeployer(fyTokenAsAccessControl, nesting + 1))
  proposal = proposal.concat(await addAsHostToCloak(cloak, fyTokenAsAccessControl, nesting + 1))

  // Give governance permissions to the Timelock
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('grantRoles', [
      [id(fyToken.interface, 'point(bytes32,address)'), id(fyToken.interface, 'setFlashFeeFactor(uint256)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `fyToken.grantRoles(gov, timelock)`))

  const join = Join__factory.connect(await fyToken.join(), fyToken.signer)

  // Allow fyToken to join and exit on the underlying Join
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      fyToken.address,
    ]),
  })

  // Add join/fyToken orchestration to cloak
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      fyToken.address,
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
  console.log(indent(nesting, `join(${getName(await fyToken.underlyingId())}).grantRoles(fyToken, join/exit)`))

  return proposal
}
