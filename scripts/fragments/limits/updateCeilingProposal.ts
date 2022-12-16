/**
 * @dev This script updates the ceiling level for the supplied base/ilk pairs.
 *
 * It uses the cauldron to set the ceiling limits for the supplied base/ilk pairs.
 */

import { getName } from '../../../shared/helpers'

import { Cauldron } from '../../../typechain'

export const updateCeilingProposal = async (
  cauldron: Cauldron,
  newCeilings: [string, string, number][]
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [baseId, ilkId, maxDebt] of newCeilings) {
    // We need to pass `min` and `dec`, but we don't want to change them, so we read them from the contract
    const debt = await cauldron.debt(baseId, ilkId)
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, maxDebt, debt.min, debt.dec]),
    })
    console.log(`${getName(baseId)}/${getName(ilkId)}: ${debt.max} -> ${maxDebt}`)
  }
  return proposal
}
