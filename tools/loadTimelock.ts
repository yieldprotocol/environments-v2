import { ethers } from 'hardhat'
import { impersonate, getName } from '../shared/helpers'
import { CAULDRON, TIMELOCK, WAD } from '../shared/constants'
import { Cauldron__factory, IERC20Metadata__factory } from '../typechain'
import { FYToken__factory } from '../typechain/factories/@yield-protocol/vault-v2/contracts';
const { governance, protocol, whales, newStrategies, mints, fyTokens } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize strategies. Only usable on testnets.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  for (let strategy of newStrategies) {
    const asset = IERC20Metadata__factory.connect(strategy.base.address, ownerAcc)

    const whaleAcc = await impersonate(whales.get(strategy.base.assetId) as string, WAD)
    await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, strategy.initAmount)

    console.log(`Loaded Timelock with ${strategy.initAmount} of ${await asset.symbol()}`)
  }

  // Once we restore the strategies due to the Euler hack, this can be removed.
  // TODO: Use always a separate fragment for token transfers from the timelock, with its own object in the proposal config
  if (mints !== undefined) {
    for (let mint of mints) {
      const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
      const fyToken = FYToken__factory.connect(fyTokens.getOrThrow(mint.seriesId)!, ownerAcc)
      console.log(`${getName(mint.seriesId)}: ${fyToken.address}`)
      const assetId = (await fyToken.underlyingId()).toUpperCase().replace('X', 'x')
      const asset = IERC20Metadata__factory.connect(await cauldron.assets(assetId), ownerAcc)

      const whaleAcc = await impersonate(whales.getOrThrow(assetId)! as string, WAD)
      await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, mint.baseAmount)

      console.log(`Loaded Timelock with ${mint.baseAmount} of ${getName(assetId)}`)
    }
  }
})()
