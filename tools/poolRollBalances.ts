import { ethers } from 'hardhat'

const { strategies, rollData } = require(process.env.CONF as string)

;(async () => {
  for (let strategyId of rollData) {

    console.log(strategyId)
    const strategy = await ethers.getContractAt('Strategy', strategies.get(strategyId) as string)
    console.log(`Strategy: ${strategy.address}`)
    const pool = await ethers.getContractAt('Pool', await strategy.pool())
    console.log(`Pool: ${pool.address}`)
    const base = await ethers.getContractAt('ERC20', await pool.base())
    console.log(`Base: ${base.address}`)
    const fyToken = await ethers.getContractAt('FYToken', await pool.fyToken())
    console.log(`FYToken: ${fyToken.address}`)
    const join = await ethers.getContractAt('Join', await fyToken.join())
    console.log(`Join: ${join.address}`)

    const poolRedeemableFYToken = await fyToken.balanceOf(pool.address)
    const poolBaseReserves = await base.balanceOf(pool.address)
    const joinReserves = await base.balanceOf(join.address)
    console.log(`${await base.symbol()} - ${await pool.maturity()}`)
    console.log(`Pool base:               ${poolBaseReserves.toString().padStart(30, ' ')}`)
    console.log(`Pool redeemable fyToken: ${poolRedeemableFYToken.toString().padStart(30, ' ')}`)
    console.log(`Join base reserves:      ${joinReserves.toString().padStart(30, ' ')}`)
    console.log(`\n`)
  }
})()
