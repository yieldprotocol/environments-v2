import { Giver } from '../../../typechain'
import { id } from '@yield-protocol/utils-v2'

/**
 * @dev This script orchestrates the Lever
 * The Lever gets access on Giver for give & seize
 */

export const orchestrateLever = async (Lever: any, giver: Giver): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('grantRoles', [
      [id(giver.interface, 'give(bytes12,address)')],
      Lever.address,
    ]),
  })
  console.log(`giver.grantRoles('give', Lever)`)

  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('grantRoles', [
      [id(giver.interface, 'seize(bytes12,address)')],
      Lever.address,
    ]),
  })
  console.log(`giver.grantRoles('seize', Lever)`)

  return proposal
}
