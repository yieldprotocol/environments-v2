/**
 * @dev This script updates the auction limits on the Witch.
 */

import { bytesToString } from '../../../shared/helpers'

import { Witch } from '../../../typechain'

export const updateWitchLimitsProposal = async (
  witch: Witch,
  newLimits: [string, number, number, number][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [ilkId, line, dust, dec] of newLimits) {
    const ilk = await witch.ilks(ilkId)
    const limits = await witch.limits(ilkId)
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setIlk', [ilkId, ilk.duration, ilk.initialOffer, line, dust, dec]),
    })
    console.log(`${bytesToString(ilkId)}: ${limits.line}/${limits.dust}/${limits.dec} -> ${limits.line}/${limits.dust}/${limits.dec}`)
  }
  return proposal
}
