import { ethers } from 'hardhat'
import { impersonate } from '../shared/helpers'
import { TIMELOCK, CAULDRON, WAD } from '../shared/constants'
import { IERC20Metadata__factory, Cauldron__factory } from '../typechain'
const { governance, protocol, whales, loadTimelock } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)

  for (let [assetId, amount] of loadTimelock) {
    const asset = IERC20Metadata__factory.connect(await cauldron.assets(assetId), ownerAcc)

    console.log(assetId)
    console.log(whales.get(assetId))
    const whaleAcc = await impersonate(whales.get(assetId) as string, WAD)
    await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, amount)

    console.log(`Loaded Timelock with ${amount} of ${await asset.symbol()}`)
  }
})()
