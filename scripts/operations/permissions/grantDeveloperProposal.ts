/**
 * @dev This script revokes governor role permissions from an account. This involves the Timelock and Cloak.
 */

import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev Grants developer permissions to an account.
 */

export const grantDeveloperProposal = async (
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
        '0xbaae8abf', // execute
        '0xf9a28e8b', // executeRepeated
      ],
      grantedAccount,
    ]),
  })
  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('grantRoles', [[id(cloak.interface, 'execute(bytes32)')], grantedAccount]),
  })  
  console.log(`Granted developer ${grantedAccount}`)

  return proposal
}