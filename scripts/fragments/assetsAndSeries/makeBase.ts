// Make an asset into a base.
// - A lending oracle is set for the new base
// - The asset is added to the Witch.

import { getName } from '../../../shared/helpers'
import { Cauldron, IOracle, Join__factory, EmergencyBrake, Witch } from '../../../typechain'
import { addBaseToWitch } from '../witch/addBaseToWitch'
import { Base } from '../../governance/confTypes'

export const makeBase = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  lendingOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  base: Base,
  joins: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  const join = Join__factory.connect(joins.getOrThrow(base.assetId)!, ownerAcc)

  proposal = proposal.concat(await addBaseToWitch(cloak, witch, base.assetId, join, nesting + 1))

  // Add the asset as a base
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setLendingOracle', [base.assetId, lendingOracle.address]),
  })
  console.log(`${'  '.repeat(nesting)}Asset ${getName(base.assetId)} made into base using ${lendingOracle.address}`)

  return proposal
}
