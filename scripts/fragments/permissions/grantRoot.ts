import { ROOT } from '../../../shared/constants'
import { AccessControl } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const grantRoot = async (
  host: AccessControl,
  userAddress: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `GRANT_ROOT`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: host.address,
    data: host.interface.encodeFunctionData('grantRole', [ROOT, userAddress]),
  })
  console.log(indent(nesting, `${host.address} grantRole(ROOT ${userAddress})`))

  return proposal
}
