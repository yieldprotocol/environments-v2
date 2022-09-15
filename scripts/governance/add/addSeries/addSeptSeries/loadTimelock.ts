import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId } from '../../../../../shared/helpers'
import { ERC20Mock, Pool } from '../../../../../typechain'
const { whales, poolsInit } = require(process.env.CONF as string)

/**
 * @dev This script loads the Timelock with funds from the holder of the DAI on arbitrum
 */
;(async () => {
  const daiHolder = await getOwnerOrImpersonate('0xc4f8dFd99ef6B88FE81413076140eC30f72Fc83a')

  const chainId = await getOriginalChainId()

  const governance = readAddressMappingIfExists('governance.json')

  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const pools = readAddressMappingIfExists('newPools.json')
    const poolAddress = pools.get(seriesId) as string

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
