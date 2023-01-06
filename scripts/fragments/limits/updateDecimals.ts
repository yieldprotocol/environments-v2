/**
 * @dev This script updates the ceiling, dust and decimals for the supplied base/ilk pairs.
 */

import { getName } from '../../../shared/helpers'

import { Cauldron } from '../../../typechain'

export const updateDecimals = async (
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
    console.log(`${getName(baseId)}/${getName(ilkId)}: ${debt.max} -> ${max}`)
    console.log(`${getName(baseId)}/${getName(ilkId)}: ${debt.min} -> ${min}`)
    console.log(`${getName(baseId)}/${getName(ilkId)}: ${debt.dec} -> ${dec}`)
  }
  return proposal
}
