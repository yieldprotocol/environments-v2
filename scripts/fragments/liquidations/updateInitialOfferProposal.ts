/**
 * @dev This script updates the dust level for the supplied base/ilk pairs.
 *
 * It uses the cauldron to set the debt limits for the supplied base/ilk pairs.
 */

import { bytesToString } from '../../../shared/helpers'

import { Witch } from '../../../typechain'

export const updateInitialOfferProposal = async (
  witch: Witch,
  newInitialOffer: [string, number][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [ilkId, initialOffer] of newInitialOffer) {
    const ilk = await witch.ilks(ilkId)
    const limits = await witch.limits(ilkId)
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setIlk', [ilkId, ilk.duration, initialOffer, limits.line, limits.dust, limits.dec]),
    })
    console.log(`${bytesToString(ilkId)}: ${ilk.initialOffer} -> ${initialOffer}`)
  }
  return proposal
}
