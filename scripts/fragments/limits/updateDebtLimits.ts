// Update the debt limits for an ilk.

import { Cauldron } from '../../../typechain'
import { Ilk } from '../../governance/confTypes'
import { indent } from '../../../shared/helpers'

export const updateDebtLimits = async (
  cauldron: Cauldron,
  ilk: Ilk,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_DEBT_LIMITS`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setDebtLimits', [
      ilk.baseId,
      ilk.ilkId,
      ilk.debtLimits.line,
      ilk.debtLimits.dust,
      ilk.debtLimits.dec,
    ]),
  })

  return proposal
}
