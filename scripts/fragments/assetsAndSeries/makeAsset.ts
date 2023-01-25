// Make an asset known to the cauldron. Note that there is no corresponding join at this point.

import { getName, indent } from '../../../shared/helpers'
import { Asset } from '../../governance/confTypes'
import { Cauldron } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const makeAsset = async (
  cauldron: Cauldron,
  asset: Asset,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MAKE_ASSET`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addAsset', [asset.assetId, asset.address]),
  })
  console.log(indent(nesting, `Make asset: ${getName(asset.assetId)}: ${asset.address},`))

  return proposal
}
