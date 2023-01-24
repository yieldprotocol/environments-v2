import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, Timelock, AccessControl__factory, Join } from '../../../../typechain'
import { removeDeployer } from '../../core/removeDeployer'
import { addAsHostToCloak } from '../../cloak/addAsHostToCloak'
import { indent } from '../../../../shared/helpers'

export const orchestrateNotionalJoin = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  join: Join,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_NOTIONAL_JOIN`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(
    await removeDeployer(AccessControl__factory.connect(join.address, join.signer), nesting + 1)
  )
  proposal = proposal.concat(
    await addAsHostToCloak(cloak, AccessControl__factory.connect(join.address, join.signer), nesting + 1)
  )

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'retrieve(address,address)'), id(join.interface, 'retrieve(address,uint256,address)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `join.grantRoles(gov, timelock)`))

  return proposal
}
