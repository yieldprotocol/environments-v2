// Update the debt limits for an ilk.

import { Cauldron } from '../../../typechain'
import { Ilk } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const updateDebtLimits = async (
  cauldron: Cauldron,
  ilk: Ilk,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  // TODO: update indent() to use groups instead of /t
  for (let i = 0; i < nesting; i++) console.group()
  console.log(`UPDATE_DEBT_LIMITS`)
  console.table({ base: getName(ilk.baseId), ilk: getName(ilk.ilkId), ...ilk.debtLimits })
  for (let i = 0; i < nesting; i++) console.groupEnd()

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
