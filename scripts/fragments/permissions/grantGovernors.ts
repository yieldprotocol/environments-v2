import { Timelock, EmergencyBrake } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev Grants governor permissions to an account.
 */

export const grantGovernors = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  grantedAccounts: string[],
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `GRANT_GOVERNORS`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let grantedAccount of grantedAccounts) {
    proposal.push({
      target: timelock.address,
      data: timelock.interface.encodeFunctionData('grantRoles', [
        [
          id(timelock.interface, 'propose((address,bytes)[])'),
          id(timelock.interface, 'approve(bytes32)'),
          id(timelock.interface, 'execute((address,bytes)[])'),
        ],
        grantedAccount,
      ]),
    })

    // Access to the cloak is direct, instead of through the timelock (which would have a delay)
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('grantRoles', [
        [
          id(cloak.interface, 'plan(address,(address,bytes4[])[])'),
          id(cloak.interface, 'cancel(address)'),
          id(cloak.interface, 'execute(address)'),
          id(cloak.interface, 'restore(address)'),
          id(cloak.interface, 'terminate(address)'),
        ],
        timelock.address,
      ]),
    })
    console.log(indent(nesting, `Granted governor ${grantedAccount}`))
  }

  return proposal
}
