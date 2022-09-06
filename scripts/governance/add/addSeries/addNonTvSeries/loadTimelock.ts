import { ethers } from 'hardhat'
import { impersonate } from '../../../../../shared/helpers'
import { WAD, DEC6, DAI, USDC } from '../../../../../shared/constants'
import { IERC20Metadata, Pool } from '../../../../../typechain'
const { governance, whales, assets, strategies, newPools, poolsInit, rollData } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  let whaleAcc = await impersonate(whales.get(USDC) as string, WAD)
  let baseAddress = assets.get(USDC)
  let base = (await ethers.getContractAt('IERC20Metadata', baseAddress)) as unknown as IERC20Metadata
  await base.connect(whaleAcc).transfer(governance.get('timelock') as string, DEC6.mul(200))

  whaleAcc = await impersonate(whales.get(DAI) as string, WAD)
  baseAddress = assets.get(DAI)
  base = (await ethers.getContractAt('IERC20Metadata', baseAddress)) as unknown as IERC20Metadata
  await base.connect(whaleAcc).transfer(governance.get('timelock') as string, WAD.mul(200))
})()
