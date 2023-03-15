/**
 * @dev This script changes the series in a number of accounts, keeping the debt and collateral unchanged.
 */
import { getName, indent, id } from '../../../shared/helpers'
import { Shifter } from '../../../typechain'
import { Cauldron } from '../../../typechain'

export const tweakWithDebt = async (
  cauldron: Cauldron,
  shifter: Shifter,
  series: string,
  vaultIds: Array<string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `TWEAK_WITH_DEBT`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // grant permissions
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [id(cauldron.interface, 'pour(bytes12,int128,int128)'), id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)')],
      shifter.address,
    ]),
  })
  console.log(indent(nesting, `cauldron.grantRoles(shifter)`))

  for (const vaultId of vaultIds) {
    // exit all to new join
    proposal.push({
      target: shifter.address,
      data: shifter.interface.encodeFunctionData('shift', [vaultIds, series]),
    })
    console.log(indent(nesting, `Shifting ${vaultId} to ${getName(series)}`))
  }

  // revoke permissions
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRoles', [
      [id(cauldron.interface, 'pour(bytes12,int128,int128)'), id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)')],
      shifter.address,
    ]),
  })
  console.log(indent(nesting, `cauldron.revokeRoles(shifter)`))

  return proposal
}
