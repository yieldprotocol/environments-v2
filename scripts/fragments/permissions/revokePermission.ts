import { AccessControl } from '../../../typechain'
import { id, indent } from '../../../shared/helpers'

export const revokePermission = async (
  host: AccessControl,
  userAddress: string,
  role: string, // Make sure this is a valid role by using id(host.interface, functionName) in the calling function
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REVOKE_PERMISSION`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: host.address,
    data: host.interface.encodeFunctionData('revokeRole', [role, userAddress]),
  })
  console.log(indent(nesting, `${host.address} revokeRole(${role} ${userAddress})`))

  return proposal
}
