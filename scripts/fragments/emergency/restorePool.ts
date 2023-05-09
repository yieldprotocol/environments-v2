/**
 * @dev This script changes the series in a number of accounts, keeping the debt and collateral unchanged.
 */
import { getName, indent } from '../../../shared/helpers'
import { PoolRestoration } from '../../governance/confTypes'
import { PoolRestorer } from '../../../typechain'

export const restorePool = async (
  poolRestorer: PoolRestorer,
  poolRestoration: PoolRestoration,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `RESTORE_POOL`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: poolRestorer.address,
    data: poolRestorer.interface.encodeFunctionData('restore', [poolRestoration.seriesId, poolRestoration.receiver, poolRestoration.amount]),
  })
  console.log(indent(nesting, `Restoring ${getName(poolRestoration.seriesId)} to ${poolRestoration.amount}`))

  return proposal
}
