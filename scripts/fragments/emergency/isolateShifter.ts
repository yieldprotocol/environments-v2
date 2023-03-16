/**
 * @dev This script isolates the Shifter
 */
import { Cauldron, Shifter } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

export const isolateShifter = async (
  cauldron: Cauldron,
  shifter: Shifter,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ISOLATE_SHIFTER`))
  let proposal: Array<{ target: string; data: string }> = []

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
