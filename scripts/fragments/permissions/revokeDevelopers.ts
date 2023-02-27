import { Timelock, EmergencyBrake } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev Revokes developer permissions from an account.
 */

export const revokeDevelopers = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  revokedAccounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REVOKE_DEVELOPERS`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let revokedAccount of revokedAccounts) {
    proposal.push({
      target: timelock.address,
      data: timelock.interface.encodeFunctionData('revokeRoles', [
        [
          id(timelock.interface, 'propose((address,bytes)[])'),
          '0x013a652d', // proposeRepeated((address,bytes)[],uint256) - Not existing in the interface anymore
          id(timelock.interface, 'execute((address,bytes)[])'),
          '0xf9a28e8b', // executeRepeated((address,bytes)[],uint256) - Not existing in the interface anymore
        ],
        revokedAccount,
      ]),
    })
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('revokeRoles', [
        [id(cloak.interface, 'execute(address)')],
        revokedAccount,
      ]),
    })
    console.log(indent(nesting, `Revoked developer ${revokedAccount}`))
  }

  return proposal
}
