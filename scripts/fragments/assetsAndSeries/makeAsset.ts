// Make an asset known to the cauldron. Note that there is no corresponding join at this point.

import { getName } from '../../../shared/helpers'
import { Asset } from '../../governance/confTypes'
import { Cauldron } from '../../../typechain'

export const makeAsset = async (cauldron: Cauldron, asset: Asset): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addAsset', [asset.assetId, asset.address]),
  })
  console.log(`[Asset: ${getName(asset.assetId)}: ${asset.address}],`)

  return proposal
}
