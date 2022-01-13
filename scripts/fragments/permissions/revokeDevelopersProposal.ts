/**
 * @dev This script revokes governor role permissions from an account. This involves the Timelock and Cloak.
 */

import { id } from '@yield-protocol/utils-v2'

import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev Revokes developer permissions from an account.
 */

export const revokeDevelopersProposal = async (
    timelock: Timelock,
    cloak: EmergencyBrake,
    revokedAccounts: string[]
  ): Promise<Array<{ target: string; data: string }>>  => {

  const proposal: Array<{ target: string; data: string }> = []
  for (let revokedAccount of revokedAccounts) {
    proposal.push({
      target: timelock.address,
      data: timelock.interface.encodeFunctionData('revokeRoles', [
        [
          id(timelock.interface, 'propose((address,bytes)[])'),
          id(timelock.interface, 'proposeRepeated((address,bytes)[],uint256)'),
          id(timelock.interface, 'execute((address,bytes)[])'),
          id(timelock.interface, 'executeRepeated((address,bytes)[],uint256)'),
        ],
        revokedAccount,
      ]),
    })
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('revokeRoles', [[id(cloak.interface, 'execute(bytes32)')], revokedAccount]),
    })
    console.log(`Revoked developer ${revokedAccount}`)
  }

  return proposal
}