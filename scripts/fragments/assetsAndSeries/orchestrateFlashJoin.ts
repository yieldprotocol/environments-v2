import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, Timelock, AccessControl__factory, FlashJoin } from '../../../typechain'
import { removeDeployer } from '../core/removeDeployer'
import { addAsHostToCloak } from '../cloak/addAsHostToCloak'

export const orchestrateFlashJoin = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  join: FlashJoin,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  console.log(`join: ${join.address}`)
  const joinAsAccessControl = AccessControl__factory.connect(join.address, join.signer)
  proposal = proposal.concat(await removeDeployer(joinAsAccessControl))
  proposal = proposal.concat(await addAsHostToCloak(cloak, joinAsAccessControl))

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'retrieve(address,address)'), id(join.interface, 'setFlashFeeFactor(uint256)')],
      timelock.address,
    ]),
  })
  console.log(`join.grantRoles(gov, timelock)`)

  return proposal
}
