import { EmergencyBrake, Timelock, AccessControl__factory, FlashJoin } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { addAsHostToCloak } from '../cloak/addAsHostToCloak'
import { indent, id } from '../../../shared/helpers'

export const orchestrateFlashJoin = async (
  deployer: string,
  timelock: Timelock,
  cloak: EmergencyBrake,
  join: FlashJoin,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_FLASH_JOIN`))
  let proposal: Array<{ target: string; data: string }> = []

  console.log(indent(nesting, `join: ${join.address}`))
  const joinAsAccessControl = AccessControl__factory.connect(join.address, join.signer)
  proposal = proposal.concat(await revokeRoot(joinAsAccessControl, deployer, nesting + 1))
  proposal = proposal.concat(await addAsHostToCloak(cloak, joinAsAccessControl, nesting + 1))

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'retrieve(address,address)'), id(join.interface, 'setFlashFeeFactor(uint256)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `join.grantRoles(gov, timelock)`))

  return proposal
}
