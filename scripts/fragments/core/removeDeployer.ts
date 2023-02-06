import { ROOT } from '../../../shared/constants'

import { AccessControl } from '../../../typechain'
import { indent } from '../../../shared/helpers'
const { deployers } = require(process.env.CONF as string)

export const removeDeployer = async (
  target: AccessControl,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `REMOVE_DEPLOYER`))
  let proposal: Array<{ target: string; data: string }> = []

  const deployer = deployers.getOrThrow(target.address)!
  if (await target.hasRole(ROOT, deployer)) {
    proposal.push({
      target: target.address,
      data: target.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
    })
    console.log(indent(nesting, `revokeRole(ROOT, deployer)`))
  }

  return proposal
}
