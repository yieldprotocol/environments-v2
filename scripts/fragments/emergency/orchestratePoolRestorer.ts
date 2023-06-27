/**
 * @dev This script orchestrates the PoolRestorer
 */
import { Timelock, PoolRestorer } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

export const orchestratePoolRestorer = async (
  deployer: string,
  timelock: Timelock,
  poolRestorer: PoolRestorer,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_POOL_RESTORER`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: poolRestorer.address,
    data: poolRestorer.interface.encodeFunctionData('grantRoles', [
      ['0xe6164b70'], //[id(poolRestorer.interface, 'restore(bytes6,address,uint256)')], // No idea why id doesn't work here
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `poolRestorer.grantRoles(restore, timelock)`))

  proposal = proposal.concat(await revokeRoot(poolRestorer, deployer, nesting + 1))

  return proposal
}
