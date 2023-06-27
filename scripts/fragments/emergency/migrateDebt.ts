/**
 * @dev This script changes the series in a number of accounts, keeping the debt and collateral unchanged.
 */
import { getName, indent } from '../../../shared/helpers'
import { Shifter } from '../../../typechain'

export const migrateDebt = async (
  shifter: Shifter,
  vaultId: string,
  seriesId: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MIGRATE_DEBT`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: shifter.address,
    data: shifter.interface.encodeFunctionData('shift', [vaultId, seriesId]),
  })
  console.log(indent(nesting, `Migrating ${vaultId} to ${getName(seriesId)}`))

  return proposal
}
