/**
 * @dev This script revokes governor role permissions from an account. This involves the Timelock and Cloak.
 */

import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev Revokes downgrades governor accounts to developers.
 */

export const governorsToDevelopers = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  accounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}GOVERNORS_TO_DEVELOPERS`)
  const proposal: Array<{ target: string; data: string }> = []
  for (let revokedAccount of accounts) {
    proposal.push({
      target: timelock.address,
      data: timelock.interface.encodeFunctionData('revokeRoles', [
        [id(timelock.interface, 'approve(bytes32)')],
        revokedAccount,
      ]),
    })

    // Access to the cloak is direct, instead of through the timelock (which would have a delay)
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('revokeRoles', [
        [
          id(cloak.interface, 'plan(address,(address,bytes4[])[])'),
          id(cloak.interface, 'cancel(bytes32)'),
          id(cloak.interface, 'restore(bytes32)'),
          id(cloak.interface, 'terminate(bytes32)'),
        ],
        revokedAccount,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}Downgraded account ${revokedAccount}`)
  }

  return proposal
}
