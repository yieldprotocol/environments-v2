/**
 * @dev This script updates the ceiling, dust and decimals for the supplied base/ilk pairs.
 */

import { bytesToString } from '../../../shared/helpers'

import { Cauldron } from '../../../typechain'

export const updateDecimalsProposal = async (
  cauldron: Cauldron,
  newDust: [string, string, number, number, number][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [baseId, ilkId, max, min, dec] of newDust) {
    const debt = await cauldron.debt(baseId, ilkId)
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, max, min, dec]),
    })
    console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)}: ${debt.max} -> ${max}`)
    console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)}: ${debt.min} -> ${min}`)
    console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)}: ${debt.dec} -> ${dec}`)
  }
  return proposal
}
