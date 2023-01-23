import { ROOT } from '../../../shared/constants'
import { AccessControl } from '../../../typechain'

export const grantRoot = async (
  host: AccessControl,
  userAddress: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}GRANT_ROOT`)
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: host.address,
    data: host.interface.encodeFunctionData('grantRole', [ROOT, userAddress]),
  })
  console.log(`${'  '.repeat(nesting)}${host.address} grantRole(ROOT ${userAddress})`)

  return proposal
}
