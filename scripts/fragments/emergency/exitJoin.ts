/**
 * @dev This script removes funds from a join.
 */
import { Join, Timelock } from '../../../typechain'
import { getName, indent, id } from '../../../shared/helpers'
import { Transfer } from '../../governance/confTypes'

export const exitJoin = async (
  timelock: Timelock,
  join: Join,
  transfer: Transfer,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `EXIT_JOINS`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // grant permissions
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'exit(address,uint128)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `join.grantRoles(exit, timelock)`))

  // exit funds
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('exit', [transfer.receiver, transfer.amount]),
  })
  console.log(indent(nesting, `Transferring ${transfer.amount} of ${getName(transfer.token.assetId)} to ${transfer.receiver}`))

  // revoke permissions
  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('revokeRoles', [
      [id(join.interface, 'exit(address,uint128)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `join.revokeRoles(exit, timelock)`))

  return proposal
}
