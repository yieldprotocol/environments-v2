import { ethers } from 'hardhat'
import { impersonate } from '../shared/helpers'
import { TIMELOCK, WAD } from '../shared/constants'
import { IERC20Metadata__factory } from '../typechain'
const { governance, whales, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  for (let strategy of newStrategies) {
    const asset = IERC20Metadata__factory.connect(strategy.base.address, ownerAcc)

    const whaleAcc = await impersonate(whales.get(strategy.base.assetId) as string, WAD)
    await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, strategy.initAmount)

    console.log(`Loaded Timelock with ${strategy.initAmount} of ${await asset.symbol()}`)
  }
})()
