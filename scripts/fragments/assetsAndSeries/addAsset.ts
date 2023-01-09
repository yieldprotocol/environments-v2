// Add an asset to the cauldron and the corresponding join to the ladle

import { Asset } from '../../governance/confTypes'
import { addJoin } from '../ladle/addJoin'
import { EmergencyBrake, Cauldron, Ladle, Join__factory } from '../../../typechain'
import { makeAsset } from './makeAsset'

export const addAsset = async (
  ownerAcc: any,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  ladle: Ladle,
  asset: Asset,
  joins: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  console.log(`Using asset at ${asset.address}`)

  const joinAddress = joins.getOrThrow(asset.assetId)
  console.log(`Using join at ${joinAddress}`)
  const join = Join__factory.connect(joinAddress, ownerAcc)

  proposal = proposal.concat(await makeAsset(cauldron, asset))
  proposal = proposal.concat(await addJoin(cloak, ladle, asset.assetId, join))

  return proposal
}
