import { ethers } from 'hardhat'
import { impersonate } from '../shared/helpers'
import { WAD } from '../shared/constants'
import { IERC20Metadata } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
const { governance, whales, strategies, newPools, poolsInit, rollData } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const poolAddress = newPools.get(seriesId) as string
    const pool = (await ethers.getContractAt('Pool', poolAddress))
    const baseAddress = await pool.base()
    const base = (await ethers.getContractAt('IERC20Metadata', baseAddress)) as IERC20Metadata

    const whaleAcc = (await impersonate(whales.get(baseId) as string, WAD)) as SignerWithAddress
    await base.connect(whaleAcc).transfer(governance.get('timelock') as string, baseAmount.add(fyTokenAmount).add(1)) // Add 1 in case we need it for a tv pool fix

    console.log(`Loaded Timelock with ${baseAmount.add(fyTokenAmount)} of ${await base.symbol()} to init pools`)
  }

  for (let [strategyId, nextSeriesId, buffer, lenderAddress, fix] of rollData) {
    if (!buffer.isZero() || fix) {
      const strategyAddress = strategies.get(strategyId)
      if (strategyAddress === undefined) throw `Strategy for ${strategyId} not found`
      else console.log(`Using strategy at ${strategyAddress} for ${strategyId}`)
      const strategy = await ethers.getContractAt('Strategy', strategyAddress)
      const baseAddress = await strategy.base()
      const baseId = await strategy.baseId()
      const base = (await ethers.getContractAt('IERC20Metadata', baseAddress))

      const whaleAcc = await impersonate(whales.get(baseId) as string, WAD)
      if (!buffer.isZero()) {
        await base.connect(whaleAcc).transfer(governance.get('timelock') as string, buffer)
        console.log(`Loaded Timelock with ${buffer} of ${await base.symbol()} as roll buffer`)
      }
      if (fix) {
        await base.connect(whaleAcc).transfer(governance.get('timelock') as string, 1)
        console.log(`Loaded Timelock with 1 of ${await base.symbol()} for the strategy roll tv fix`)
      }
    }
  }
})()
