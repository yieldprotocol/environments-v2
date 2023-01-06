import { Giver } from '../../../typechain'
/**
 * @dev This script bans an ilk on giver contract
 */
export const banIlk = async (
  giver: Giver,
  banIlk: string,
  banState: boolean
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('banIlk', [banIlk, banState]),
  })
  console.log(`giver.banIlk(${banIlk},${banState})`)

  return proposal
}
