import { ethers } from 'hardhat'
import { impersonate, getName } from '../shared/helpers'
import { WAD, TIMELOCK } from '../shared/constants'
import { IERC20Metadata__factory } from '../typechain'
const { governance, timelockFunding, whales } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize strategies. Only usable on testnets.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  for (let transfer of timelockFunding) {
    const asset = IERC20Metadata__factory.connect(transfer.token.address, ownerAcc)

    console.log(transfer.token.assetId)
    console.log(whales.get(transfer.token.assetId))
    const whaleAcc = await impersonate(whales.get(transfer.token.assetId) as string, WAD)
    await asset.connect(whaleAcc).transfer(governance.getOrThrow(TIMELOCK)!, transfer.amount)

    console.log(`Loaded Timelock with ${transfer.amount} of ${getName(transfer.token.assetId)}`)
  }
})()
