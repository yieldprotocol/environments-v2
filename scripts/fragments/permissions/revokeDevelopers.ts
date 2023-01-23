/**
 * @dev This script revokes governor role permissions from an account. This involves the Timelock and Cloak.
 */

import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev Revokes developer permissions from an account.
 */

export const revokeDevelopers = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  revokedAccounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}REVOKE_DEVELOPERS`)
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
        [id(cloak.interface, 'execute(bytes32)')],
        revokedAccount,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}Revoked developer ${revokedAccount}`)
  }

  return proposal
}
