import { ethers } from 'hardhat'
import { getName } from '../shared/helpers'
import { Pool__factory } from '../typechain';
const { pools } = require(process.env.CONF as string)

;(async () => {
  for (let [seriesId, poolAddress] of pools) {

    const pool = Pool__factory.connect(poolAddress, ethers.provider)
    console.log(`Pool: ${pool.address}`)

    const poolTotalSupply = await pool.totalSupply()
    const poolCache = await pool.getCache()
    const poolBase = poolCache[0]
    const poolFYToken = poolCache[1].sub(poolTotalSupply)
    const ratio = poolFYToken.isZero() ? 0 :  poolBase.mul(1000000).div(poolFYToken)

    console.log(`Series: ${getName(seriesId)}`)
    console.log(`Pool base:               ${poolBase}`)
    console.log(`Pool fyToken:            ${poolFYToken}`)
    console.log(`Pool ratio:              ${ratio}`)
    console.log(`\n`)
  }
})()
