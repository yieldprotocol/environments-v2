import { id } from '@yield-protocol/utils-v2'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { indent } from '../../../shared/helpers'

/**
 * @dev Revokes execute permissions on the cloak from an account.
 */

export const revokeCloakExecute = async (
  cloak: EmergencyBrake,
  revokedAccounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REVOKE_CLOAK_EXECUTE`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let revokedAccount of revokedAccounts) {
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('revokeRoles', [
        [id(cloak.interface, 'execute(address)')],
        revokedAccount,
      ]),
    })
    console.log(indent(nesting, `Revoked executor ${revokedAccount}`))
  }

  return proposal
}
