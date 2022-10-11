import { ethers } from 'hardhat'

import { ASSET_IDS } from '../../shared/constants'
import { Entity, Permission, Role, Asset, Join, YieldProtocol } from './yieldTypes'
import { Cauldron__factory, Ladle__factory, Join__factory, IERC20Metadata__factory } from '../../typechain'

/// @dev Populates the protocol object with assets
export const loadAssets = async (protocol: YieldProtocol): Promise<YieldProtocol> => {
  let [ownerAcc] = await ethers.getSigners()
  const cauldron = Cauldron__factory.connect(protocol.cauldron.address, ownerAcc)
  for (let assetId of ASSET_IDS.values()) {
    const assetAddress = await cauldron.assets(assetId)
    if ((await ethers.provider.getCode(assetAddress)) === '0x') throw `Address ${assetAddress} contains no code`
    const asset = IERC20Metadata__factory.connect(assetAddress, ownerAcc)
    protocol.assets.set(
      assetId,
      new Asset({
        assetId: assetId,
        address: assetAddress,
        name: await asset.name(),
        symbol: await asset.symbol(),
        decimals: await asset.decimals(),
      })
    )
  }
  return protocol
}

/// @dev Populates the protocol object with joins
/// @notice The protocol needs to have been populated with assets first
export const loadJoins = async (protocol: YieldProtocol): Promise<YieldProtocol> => {
  let [ownerAcc] = await ethers.getSigners()
  const ladle = Ladle__factory.connect(protocol.ladle.address, ownerAcc)
  for (let asset of protocol.assets.values()) {
    const joinAddress = await ladle.joins(asset.assetId)
    if ((await ethers.provider.getCode(joinAddress)) === '0x')
      console.warn(`There is no join for asset ${asset.assetId}`)
    protocol.joins.set(
      asset.assetId,
      new Join({
        asset: asset,
        address: joinAddress,
      })
    )
  }
  return protocol
}
