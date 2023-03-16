/**
 * @dev This script orchestrates the Shifter
 */
import { Timelock, Cauldron, Shifter } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

export const orchestrateShifter = async (
  deployer: string,
  timelock: Timelock,
  cauldron: Cauldron,
  shifter: Shifter,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_SHIFTER`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: shifter.address,
    data: shifter.interface.encodeFunctionData('grantRoles', [
      [id(shifter.interface, 'shift(bytes12,bytes6)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `shifter.grantRoles(shift, timelock)`))

  // grant permissions
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [id(cauldron.interface, 'pour(bytes12,int128,int128)'), id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)')],
      shifter.address,
    ]),
  })
  console.log(indent(nesting, `cauldron.grantRoles(shifter)`))

  proposal = proposal.concat(await revokeRoot(shifter, deployer, nesting + 1))

  return proposal
}
