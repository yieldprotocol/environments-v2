/**
 * @dev This script revokes governor role permissions from an account. This involves the Timelock and Cloak.
 */

import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev Grants developer permissions to an account.
 */

export const grantDevelopers = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  grantedAccounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  for (let grantedAccount of grantedAccounts) {
    proposal.push({
      target: timelock.address,
      data: timelock.interface.encodeFunctionData('grantRoles', [
        [id(timelock.interface, 'propose((address,bytes)[])'), id(timelock.interface, 'execute((address,bytes)[])')],
        grantedAccount,
      ]),
    })
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('grantRoles', [
        [id(cloak.interface, 'execute(bytes32)')],
        grantedAccount,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}Granted developer ${grantedAccount}`)
  }

  return proposal
}
