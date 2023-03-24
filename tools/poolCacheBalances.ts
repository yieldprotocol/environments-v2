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

    console.log(`Series: ${getName(seriesId)}`)
    console.log(`Pool base:               ${poolCache[0]}`)
    console.log(`Pool fyToken:            ${poolCache[1].sub(poolTotalSupply)}`)
    console.log(`\n`)
  }
})()
