import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { Pool, ERC20Mock } from '../../../../typechain'
const { developer, poolData } = require(process.env.CONF as string)

/**
 * @dev This script shows up the balance of the reserves and the pool
 */
;(async () => {
  const pools = readAddressMappingIfExists('newPools.json')
  let ownerAcc = await getOwnerOrImpersonate(developer)

  for (let [seriesId, baseAddress, fyTokenAddress, ts, g1, g2] of poolData) {
    const pool = (await ethers.getContractAt('Pool', pools.get(seriesId) as string, ownerAcc)) as unknown as Pool

    const base = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      baseAddress,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(`${await base.callStatic.name()} Balance of pool`, (await base.balanceOf(pool.address)).toString())
    console.log(`Virtual Balance of pool`, (await pool.callStatic.getFYTokenBalance()).toString())
    const fyToken = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      fyTokenAddress,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(
      `${await fyToken.callStatic.name()} Balance of pool`,
      (await fyToken.balanceOf(pool.address)).toString()
    )

    console.log('-------------------------------------')
  }
})()
