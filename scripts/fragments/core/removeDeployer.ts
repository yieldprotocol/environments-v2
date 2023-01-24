import { ROOT } from '../../../shared/constants'

import { AccessControl } from '../../../typechain'
const { deployers } = require(process.env.CONF as string)

export const removeDeployer = async (target: AccessControl): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  const deployer = deployers.get(target.address)
  if (await target.hasRole(ROOT, deployer)) {
    proposal.push({
      target: target.address,
      data: target.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
    })
    console.log(`revokeRole(ROOT, deployer)`)
  }

  return proposal
}
