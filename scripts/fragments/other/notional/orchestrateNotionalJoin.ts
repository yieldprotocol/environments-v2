import { EmergencyBrake, Timelock, AccessControl__factory, NotionalJoin } from '../../../../typechain'
import { revokeRoot } from '../../permissions/revokeRoot'
import { addAsHostToCloak } from '../../cloak/addAsHostToCloak'
import { indent, id } from '../../../../shared/helpers'

export const orchestrateNotionalJoin = async (
  deployer: string,
  timelock: Timelock,
  cloak: EmergencyBrake,
  join: NotionalJoin,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_NOTIONAL_JOIN`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(
    await revokeRoot(AccessControl__factory.connect(join.address, join.signer), deployer, nesting + 1)
  )
  proposal = proposal.concat(
    await addAsHostToCloak(cloak, AccessControl__factory.connect(join.address, join.signer), nesting + 1)
  )

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'retrieve(address,address)'), id(join.interface, 'retrieveERC1155(address,uint256,address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `join.grantRoles(gov, timelock)`))

  return proposal
}
