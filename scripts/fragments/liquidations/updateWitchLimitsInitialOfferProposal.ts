/**
 * @dev This script updates the auction limits & initial offer on the Witch.
 */

import { DISPLAY_NAMES } from '../../../shared/constants'

import { OldWitch } from '../../../typechain'

export const updateWitchLimitsInitialOfferProposal = async (
  witch: OldWitch,
  newLimits: [string, string, number, number, number][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  console.log()
  console.log('Auction Limits (dust)')
  for (let [ilkId, dust] of newLimits) {
    const ilk = await witch.ilks(ilkId)
    const limits = await witch.limits(ilkId)
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setIlk', [
        ilkId,
        ilk.duration,
        ilk.initialOffer,
        limits.line,
        dust,
        limits.dec,
      ]),
    })
    console.log(`${DISPLAY_NAMES.get(ilkId)}: ${limits.dust} -> ${dust}`)
  }
  return proposal
}
