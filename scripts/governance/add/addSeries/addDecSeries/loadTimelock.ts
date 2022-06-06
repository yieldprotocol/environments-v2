import { ethers } from 'hardhat'
import { readAddressMappingIfExists, impersonate, getOriginalChainId } from '../../../../../shared/helpers'
import { WAD } from '../../../../../shared/constants'
import { ERC20Mock, Pool } from '../../../../../typechain'
const { governance, whales, newPools, poolsInit } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const whaleAcc = await impersonate(whales.get(baseId) as string, WAD)
    const poolAddress = newPools.get(seriesId) as string

    const pool = (await ethers.getContractAt('Pool', poolAddress, whaleAcc)) as Pool
    const baseAddress = await pool.base()

    const base = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      baseAddress,
      whaleAcc
    )) as unknown as ERC20Mock
    await base.connect(whaleAcc).transfer(governance.get('timelock') as string, baseAmount.add(fyTokenAmount))
    console.log(`Loaded Timelock with ${baseAmount.add(fyTokenAmount)} of ${await base.symbol()}`)
  }
})()
