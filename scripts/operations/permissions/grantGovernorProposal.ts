/**
 * @dev This script revokes governor role permissions from an account. This involves the Timelock and Cloak.
 */

import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev Grants governor permissions to an account.
 */

export const grantGovernorProposal = async (
    timelock: Timelock,
    cloak: EmergencyBrake,
    grantedAccount: string
  ): Promise<Array<{ target: string; data: string }>>  => {

  const proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: timelock.address,
    data: timelock.interface.encodeFunctionData('grantRoles', [
      [
        '0xca02753a', // propose,
        '0x013a652d', // proposeRepeated
        '0xa53a1adf', // approve
        '0xbaae8abf', // execute
        '0xf9a28e8b', // executeRepeated
      ],
      grantedAccount,
    ]),
  })

  // Access to the cloak is direct, instead of through the timelock (which would have a delay)
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRoles', [
      [
        '0xde8a0667', // id(cloak.interface, 'plan(address,tuple[])'),
        id(cloak.interface, 'cancel(bytes32)'),
        id(cloak.interface, 'execute(bytes32)'),
        id(cloak.interface, 'restore(bytes32)'),
        id(cloak.interface, 'terminate(bytes32)'),
      ],
      timelock.address,
    ]),
  })
  console.log(`Granted governor ${grantedAccount}`)

  return proposal
}