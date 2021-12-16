import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { ERC20Mock, Pool } from '../../../../typechain'
import { developer, poolsInit } from './addJuneSeries.rinkeby.config'

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const governance = readAddressMappingIfExists('governance.json');

  for (let [seriesId, baseAmount, fyTokenAmount] of poolsInit) {

    const pools = readAddressMappingIfExists('newPools.json');
    const poolAddress = pools.get(seriesId) as string
    const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool
    const baseAddress = await pool.base()
    const base = (await ethers.getContractAt('ERC20Mock', baseAddress, ownerAcc)) as unknown as ERC20Mock

    await base.mint(governance.get('timelock') as string, baseAmount.add(fyTokenAmount))
    console.log(`Loaded Timelock with ${baseAmount.add(fyTokenAmount)} of ${await base.symbol()}`)
  }
})()