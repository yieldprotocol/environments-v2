import { Giver } from '../../../typechain'
/**
 * @dev This script blacklists an ilk on giver contract
 */
export const blacklistIlkProposal = async (
  giver: Giver,
  blacklistIlk: string
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: giver.address,
    data: giver.interface.encodeFunctionData('blacklistIlk', [blacklistIlk]),
  })
  console.log(`giver.blacklistIlk(${blacklistIlk})`)

  return proposal
}
