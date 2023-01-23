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
  console.log(`\n${'  '.repeat(nesting)}ORCHESTRATE_FLASH_JOIN`)
  let proposal: Array<{ target: string; data: string }> = []

  console.log(`${'  '.repeat(nesting)}join: ${join.address}`)
  const joinAsAccessControl = AccessControl__factory.connect(join.address, join.signer)
  proposal = proposal.concat(await removeDeployer(joinAsAccessControl, nesting + 1))
  proposal = proposal.concat(await addAsHostToCloak(cloak, joinAsAccessControl, nesting + 1))

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'retrieve(address,address)'), id(join.interface, 'setFlashFeeFactor(uint256)')],
      timelock.address,
    ]),
  })
  console.log(`${'  '.repeat(nesting)}join.grantRoles(gov, timelock)`)

  return proposal
}
