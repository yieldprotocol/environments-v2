/**
 * @dev This script isolates the PoolRestorer
 */
import { Timelock, PoolRestorer } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

export const isolatePoolRestorer = async (
  timelock: Timelock,
  poolRestorer: PoolRestorer,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ISOLATE_POOL_RESTORER`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: poolRestorer.address,
    data: poolRestorer.interface.encodeFunctionData('revokeRoles', [
      ['0xe6164b70'], //[id(poolRestorer.interface, 'restore(bytes6,address,uint256)')], // No idea why id doesn't work here
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `poolRestorer.revokeRoles(restore, timelock)`))

  return proposal
}
