import { id } from '@yield-protocol/utils-v2'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { indent } from '../../../shared/helpers'

/**
 * @dev Revokes governor permissions from an account.
 */

export const revokeGovernors = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  revokedAccounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REVOKE_GOVERNORS`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let revokedAccount of revokedAccounts) {
    proposal.push({
      target: timelock.address,
      data: timelock.interface.encodeFunctionData('revokeRoles', [
        [
          id(timelock.interface, 'propose((address,bytes)[])'),
          '0x013a652d', // proposeRepeated((address,bytes)[],uint256) - Not existing in the interface anymore
          id(timelock.interface, 'approve(bytes32)'),
          id(timelock.interface, 'execute((address,bytes)[])'),
          '0xf9a28e8b', // executeRepeated((address,bytes)[],uint256) - Not existing in the interface anymore
        ],
        revokedAccount,
      ]),
    })

    // Access to the cloak is direct, instead of through the timelock (which would have a delay)
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('revokeRoles', [
        [
          id(cloak.interface, 'plan(address,(address,bytes4[])[])'),
          id(cloak.interface, 'cancel(address)'),
          id(cloak.interface, 'execute(address)'),
          id(cloak.interface, 'restore(address)'),
          id(cloak.interface, 'terminate(address)'),
        ],
        revokedAccount,
      ]),
    })
    console.log(indent(nesting, `Revoked governor ${revokedAccount}`))
  }

  return proposal
}
