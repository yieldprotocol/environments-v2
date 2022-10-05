import { Cauldron, Giver, Timelock } from '../../../typechain'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'
/**
 * @dev This script orchestrates the giver
 * The giver gets give access on cauldron. timelock gets access to banIlk.
 * Revokes the ROOT role of deployer
 */
export const orchestrateGiverProposal = async (
  giver: Giver,
  cauldron: Cauldron,
  timelock: Timelock,
  deployer: string
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [id(cauldron.interface, 'give(bytes12,address)')],
      giver.address,
    ]),
  })

  console.log(`cauldron.grantRoles('give', giver)`)
  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('grantRoles', [
      [id(giver.interface, 'banIlk(bytes6,bool)')],
      timelock.address,
    ]),
  })
  console.log(`timelock.grantRoles('giver', banIlk)`)
  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })
  console.log(`giver.revokeRole(ROOT, deployer)`)
  return proposal
}
