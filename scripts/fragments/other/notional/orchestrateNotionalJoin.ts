import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, Timelock, AccessControl__factory, Join } from '../../../../typechain'
import { removeDeployer } from '../../core/removeDeployer'
import { addAsHostToCloak } from '../../cloak/addAsHostToCloak'

export const orchestrateNotionalJoin = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  join: Join
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await removeDeployer(AccessControl__factory.connect(join.address, join.signer)))
  proposal = proposal.concat(await addAsHostToCloak(cloak, AccessControl__factory.connect(join.address, join.signer)))

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'retrieve(address,address)'), id(join.interface, 'retrieve(address,uint256,address)')],
      timelock.address,
    ]),
  })
  console.log(`join.grantRoles(gov, timelock)`)

  return proposal
}
