import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOwnerOrImpersonate,
  getOriginalChainId,
  impersonate,
} from '../../../../shared/helpers'

import { ERC20Mock, Pool, WETH9Mock } from '../../../../typechain'
import { ETH, WAD } from '../../../../shared/constants'
const { developer, assets } = require(process.env.CONF as string)
const { whales, poolsInit } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  const chainId = await getOriginalChainId()

  const governance = readAddressMappingIfExists('governance.json')

  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const whaleAcc = await impersonate('0x183d0dc5867c01bfb1dbbc41d6a9d3de6e044626')
    const pools = readAddressMappingIfExists('newPools.json')
    const poolAddress = pools.get(seriesId) as string

    const pool = (await ethers.getContractAt('Pool', poolAddress, whaleAcc)) as Pool
    const baseAddress = await pool.base()

    const base = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      baseAddress,
      whaleAcc
    )) as unknown as ERC20Mock
    await base.connect(whaleAcc).transfer(governance.get('timelock') as string, baseAmount.add(fyTokenAmount).mul(4))
    console.log(`Loaded Timelock with ${baseAmount.add(fyTokenAmount)} of ${await base.symbol()}`)
  }
})()
