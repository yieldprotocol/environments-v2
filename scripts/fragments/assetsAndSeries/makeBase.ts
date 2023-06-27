// Make an asset into a base.
// - A lending oracle is set for the new base
// - The asset is added to the Witch.

import { getName, indent } from '../../../shared/helpers'
import { Cauldron, EmergencyBrake, IOracle__factory, Join__factory, Witch } from '../../../typechain'
import { Base } from '../../governance/confTypes'
import { addBaseToWitch } from '../witch/addBaseToWitch'

export const makeBase = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  base: Base,
  joins: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MAKE_BASE`))
  let proposal: Array<{ target: string; data: string }> = []
  const join = Join__factory.connect(joins.getOrThrow(base.assetId)!, ownerAcc)
  const lendingOracle = IOracle__factory.connect(base.rateOracle, ownerAcc)

  proposal = proposal.concat(await addBaseToWitch(cloak, witch, base.assetId, join, nesting + 1))

  // Add the asset as a base
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setLendingOracle', [base.assetId, lendingOracle.address]),
  })
  console.log(indent(nesting, `Asset ${getName(base.assetId)} made into base using ${lendingOracle.address}`))

  return proposal
}
