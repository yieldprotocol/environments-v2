import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOriginalChainId, impersonate } from '../../../../../shared/helpers'
import * as hre from 'hardhat'
import { ERC20Mock, Pool } from '../../../../../typechain'
import { WAD } from '../../../../../shared/constants'
const { poolsInit } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with assets to initialize pools and strategies. Only usable on testnets.
 */
;(async () => {
  const chainId = await getOriginalChainId()

  const governance = readAddressMappingIfExists('governance.json')

  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const whaleAcc = await impersonate('0x183d0dc5867c01bfb1dbbc41d6a9d3de6e044626', WAD)
    const pools = readAddressMappingIfExists('newPools.json')
    const poolAddress = pools.get(seriesId) as string

    const pool = (await ethers.getContractAt('Pool', poolAddress, whaleAcc)) as Pool
    const baseAddress = await pool.base()

    const base = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      baseAddress,
      whaleAcc
    )) as unknown as ERC20Mock
    if (chainId !== 1) {
      await base.connect(whaleAcc).mint(governance.get('timelock') as string, baseAmount.add(fyTokenAmount).mul(4))
      console.log(`Loaded Timelock with ${baseAmount.add(fyTokenAmount)} of ${await base.symbol()}`)
    } else if (hre.network.name == 'localhost') {
      await base.connect(whaleAcc).transfer(governance.get('timelock') as string, baseAmount.add(fyTokenAmount).mul(4))
      console.log(`Loaded Timelock with ${baseAmount.add(fyTokenAmount)} of ${await base.symbol()}`)
    }
  }
})()
