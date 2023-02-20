import { Timelock, EmergencyBrake } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev Grants developer permissions to an account.
 */

export const grantDevelopers = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  grantedAccounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `GRANT_DEVELOPERS`))
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
        [id(cloak.interface, 'execute(address)')],
        grantedAccount,
      ]),
    })
    console.log(indent(nesting, `Granted developer ${grantedAccount}`))
  }

  return proposal
}
