import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, Timelock, AccessControl__factory, Join } from '../../../typechain'
import { removeDeployer } from '../core/removeDeployer'
import { addAsHostToCloak } from '../cloak/addAsHostToCloak'

export const orchestrateJoin = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  join: Join
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  const joinAsAccessControl = AccessControl__factory.connect(join.address, join.signer)
  proposal = proposal.concat(await removeDeployer(joinAsAccessControl))
  proposal = proposal.concat(await addAsHostToCloak(cloak, joinAsAccessControl))

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'retrieve(address,address)')],
      timelock.address,
    ]),
  })
  console.log(`join.grantRoles(gov, timelock)`)

  return proposal
}
