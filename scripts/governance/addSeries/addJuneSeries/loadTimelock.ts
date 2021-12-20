import { ethers } from 'hardhat'
import { readAddressMappingIfExists, impersonate, getOriginalChainId } from '../../../../shared/helpers'
import { WAD } from '../../../../shared/constants'
import { ERC20Mock, Pool } from '../../../../typechain'
import { whales, poolsInit } from './addJuneSeries.mainnet.config'

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  const governance = readAddressMappingIfExists('governance.json');

  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const whaleAcc = await impersonate(whales.get(baseId) as string, WAD)
    const pools = readAddressMappingIfExists('newPools.json');
    const poolAddress = pools.get(seriesId) as string

    const pool = (await ethers.getContractAt('Pool', poolAddress, whaleAcc)) as Pool
    const baseAddress = await pool.base()

    const base = (await ethers.getContractAt('ERC20Mock', baseAddress, whaleAcc)) as unknown as ERC20Mock
    await base.connect(whaleAcc).transfer(governance.get('timelock') as string, baseAmount.add(fyTokenAmount))
    console.log(`Loaded Timelock with ${baseAmount.add(fyTokenAmount)} of ${await base.symbol()}`)
  }
})()