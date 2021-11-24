/**
 * @dev This script revokes governor role permissions from an account. This involves the Timelock and Cloak.
 */

import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev Revokes governor permissions from an account.
 */

export const revokeGovernorProposal = async (
    timelock: Timelock,
    cloak: EmergencyBrake,
    revokedAccount: string
  ): Promise<Array<{ target: string; data: string }>>  => {

  const proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: timelock.address,
    data: timelock.interface.encodeFunctionData('revokeRoles', [
      [
        id(timelock.interface, 'propose((address,bytes)[])'),
        id(timelock.interface, 'proposeRepeated((address,bytes)[],uint256)'),
        id(timelock.interface, 'approve(bytes32)'),
        id(timelock.interface, 'execute((address,bytes)[])'),
        id(timelock.interface, 'executeRepeated((address,bytes)[],uint256)'),
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
        id(cloak.interface, 'cancel(bytes32)'),
        id(cloak.interface, 'execute(bytes32)'),
        id(cloak.interface, 'restore(bytes32)'),
        id(cloak.interface, 'terminate(bytes32)'),
      ],
      revokedAccount,
    ]),
  })
  console.log(`Revoked governor ${revokedAccount}`)

  return proposal
}