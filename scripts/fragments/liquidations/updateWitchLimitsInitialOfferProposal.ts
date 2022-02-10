/**
 * @dev This script updates the auction limits & initial offer on the Witch.
 */

import { bytesToString } from '../../../shared/helpers'

import { Witch } from '../../../typechain'

export const updateWitchLimitsInitialOfferProposal = async (
  witch: Witch,
  newLimits: [string, number, number, number, number][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [ilkId, initialOffer, line, dust, dec] of newLimits) {
    const ilk = await witch.ilks(ilkId)
    const limits = await witch.limits(ilkId)
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setIlk', [ilkId, ilk.duration, initialOffer, line, dust, dec]),
    })
    console.log(
      `${bytesToString(ilkId)}: ${ilk.initialOffer}/${limits.line}/${limits.dust}/${
        limits.dec
      } -> ${initialOffer}/${line}/${dust}/${dec}`
    )
  }
  return proposal
}
