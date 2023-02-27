import { Cauldron, Giver, Timelock } from '../../../typechain'
import { ROOT } from '../../../shared/constants'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script orchestrates the giver
 * The giver gets give access on cauldron. timelock gets access to banIlk.
 * Revokes the ROOT role of deployer
 */
export const orchestrateGiver = async (
  giver: Giver,
  cauldron: Cauldron,
  timelock: Timelock,
  deployer: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_GIVER`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [id(cauldron.interface, 'give(bytes12,address)')],
      giver.address,
    ]),
  })
  console.log(indent(nesting, `cauldron.grantRoles('give', giver)`))
  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('grantRoles', [
      [id(giver.interface, 'banIlk(bytes6,bool)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `timelock.grantRoles('giver', banIlk)`))
  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(indent(nesting, `giver.revokeRole(ROOT, deployer)`))
  return proposal
}
