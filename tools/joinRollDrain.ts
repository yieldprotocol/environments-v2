import { ethers } from 'hardhat'

const { pools } = require(process.env.CONF as string)


;(async () => {
  for (let [seriesId, poolAddress] of pools) {
    const pool = (await ethers.getContractAt('Pool', poolAddress))
    const base = (await ethers.getContractAt('ERC20', await pool.base()))
    const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken()))
    const join = (await ethers.getContractAt('Join', await fyToken.join()))
  
    console.log(`${seriesId}: ${await base.symbol()} ${await fyToken.maturity()}`)
    console.log(`Pool: ${pool.address}`)
    console.log(`Join: ${join.address}`)
    const poolRedeemableFYToken = await fyToken.balanceOf(pool.address)
    const poolBaseReserves = await base.balanceOf(pool.address)
    const joinReserves = await base.balanceOf(join.address)
    console.log(`Pool base:               ${poolBaseReserves.toString().padStart(30, ' ')}`)
    console.log(`Pool redeemable fyToken: ${poolRedeemableFYToken.toString().padStart(30, ' ')}`)
    console.log(`Join base reserves:      ${joinReserves.toString().padStart(30, ' ')}`)
    console.log(`\n`)
  }
})()
