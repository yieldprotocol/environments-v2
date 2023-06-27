import { ethers } from 'hardhat'
import { Permission } from '../../governance/confTypes'
import { indent } from '../../../shared/helpers'
import { AccessControl__factory } from '../../../typechain';

/**
 * @dev Revokes an access control permission.
 */

export const revokePermission = async (
  permission: Permission, // Make sure this is a valid role by using id(host.interface, functionName) in the calling function
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REVOKE_PERMISSION`))
  const host = AccessControl__factory.connect(permission.host, ethers.provider)
  const proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: host.address,
    data: host.interface.encodeFunctionData('revokeRoles', [
      [permission.functionName],
      permission.user,
    ]),
  })
  console.log(indent(nesting, `Revoked ${host.address}.${permission.functionName} from ${permission.user}`))

  return proposal
}
