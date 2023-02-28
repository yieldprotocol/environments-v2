// Make an asset into a base.
// - A lending oracle is set for the new base
// - The asset is added to the Witch.

import { getName, indent } from '../../../shared/helpers'
import { IOracle, Join__factory, EmergencyBrake, VRCauldron, VRWitch, Witch } from '../../../typechain'
import { addBaseToWitch } from '../witch/addBaseToWitch'
import { Base } from '../../governance/confTypes'

export const makeVRBase = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  rateOracle: IOracle,
  cauldron: VRCauldron,
  witch: VRWitch,
  base: Base,
  joins: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MAKE_BASE`))
  let proposal: Array<{ target: string; data: string }> = []
  const join = Join__factory.connect(joins.getOrThrow(base.assetId)!, ownerAcc)

  proposal = proposal.concat(await addBaseToWitch(cloak, witch as unknown as Witch, base.assetId, join, nesting + 1))

  // Add the asset as a base
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setRateOracle', [base.assetId, rateOracle.address]),
  })
  console.log(indent(nesting, `Rate Oracle ${rateOracle.address} added for Asset ${getName(base.assetId)}`))
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addBase', [base.assetId]),
  })
  console.log(indent(nesting, `Asset ${getName(base.assetId)} made into base using ${rateOracle.address}`))

  return proposal
}
