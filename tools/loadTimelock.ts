import { ethers } from 'hardhat'
import { impersonate, getName } from '../shared/helpers'
import { WAD, ETH, TIMELOCK } from '../shared/constants'
import { IERC20Metadata__factory } from '../typechain'
const { governance, assets, whales } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize strategies. Only usable on testnets.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  const assetId = ETH
  const amount = '15000000000000000000'

  const asset = IERC20Metadata__factory.connect(assets.getOrThrow(assetId)!, ownerAcc)
  const whaleAcc = await impersonate(whales.get(assetId) as string, WAD)
  await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, amount)
  console.log(`Loaded Timelock with ${amount} ${getName(assetId)}`)

//  for (let strategy of newStrategies) {
//    const asset = IERC20Metadata__factory.connect(strategy.base.address, ownerAcc)
//
//    const whaleAcc = await impersonate(whales.get(strategy.base.assetId) as string, WAD)
//    await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, strategy.initAmount)
//
//    console.log(`Loaded Timelock with ${strategy.initAmount} of ${await asset.symbol()}`)
//  }
})()
