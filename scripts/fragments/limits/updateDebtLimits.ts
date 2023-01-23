// Update the debt limits for an ilk.

import { Cauldron } from '../../../typechain'
import { Ilk } from '../../governance/confTypes'

export const updateDebtLimits = async (
  cauldron: Cauldron,
  ilk: Ilk
): Promise<Array<{ target: string; data: string }>> => {
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
