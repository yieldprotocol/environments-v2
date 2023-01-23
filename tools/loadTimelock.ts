import { ethers } from 'hardhat'
import { impersonate } from '../shared/helpers'
import { TIMELOCK, WAD } from '../shared/constants'
import { IERC20Metadata__factory } from '../typechain'
const { governance, whales, newSeries } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  for (let series of newSeries) {
    const asset = IERC20Metadata__factory.connect(series.base.address , ownerAcc)

    const whaleAcc = await impersonate(whales.get(series.base.assetId) as string, WAD)
    await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, series.poolInitAmount)

    console.log(`Loaded Timelock with ${series.poolInitAmount} of ${await asset.symbol()}`)
  }
})()
