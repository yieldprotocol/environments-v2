/**
 * @dev This script updates the debt limits for the supplied base/ilk pairs.
 *
 * It uses the cauldron to set the debt limits for the supplied base/ilk pairs.
 */

import { getName } from '../../../shared/helpers'

import { Cauldron } from '../../../typechain'

export const updateLimitsProposal = async (
  cauldron: Cauldron,
  newLimits: [string, string, number, number, number][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [baseId, ilkId, maxDebt, minDebt, decDebt] of newLimits) {
    const debt = await cauldron.debt(baseId, ilkId)
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, maxDebt, minDebt, decDebt]),
    })
    console.log(`${getName(baseId)}/${getName(ilkId)}: ${maxDebt}/${minDebt}|${decDebt}`)
  }
  return proposal
}
