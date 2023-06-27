import { ethers } from 'hardhat'
import { Permission } from '../../governance/confTypes'
import { indent } from '../../../shared/helpers'
import { AccessControl__factory } from '../../../typechain';

/**
 * @dev Grants an access control permission.
 */

export const grantPermission = async (
  permission: Permission, // Make sure this is a valid role by using id(host.interface, functionName) in the calling function
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `GRANT_PERMISSION`))
  const host = AccessControl__factory.connect(permission.host, ethers.provider)
  const proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: host.address,
    data: host.interface.encodeFunctionData('grantRoles', [
      [permission.functionName],
      permission.user,
    ]),
  })
  console.log(indent(nesting, `Granted ${host.address}.${permission.functionName} from ${permission.user}`))

  return proposal
}
