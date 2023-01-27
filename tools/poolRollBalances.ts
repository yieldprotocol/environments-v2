import { ethers } from 'hardhat'

import { getName } from '../shared/helpers'
import { Strategy__factory, Pool__factory, ERC20__factory, FYToken__factory, Join__factory } from '../typechain';
const { rollStrategies } = require(process.env.CONF as string)

;(async () => {
  for (let strategy of rollStrategies) {

    console.log(getName(strategy.assetId))
    console.log(`Strategy: ${strategy.address}`)
    const strategyContract = Strategy__factory.connect(strategy.address, ethers.provider)
    const pool = Pool__factory.connect(await strategyContract.pool(), ethers.provider)
    console.log(`Pool: ${pool.address}`)
    const base = ERC20__factory.connect(await pool.base(), ethers.provider)
    console.log(`Base: ${base.address}`)
    const fyToken = FYToken__factory.connect(await pool.fyToken(), ethers.provider)
    console.log(`FYToken: ${fyToken.address}`)
    const join = Join__factory.connect(await fyToken.join(), ethers.provider)
    console.log(`Join: ${join.address}`)

    const poolRedeemableFYToken = await fyToken.balanceOf(pool.address)
    const poolBaseReserves = await pool.getBaseBalance()
    const joinReserves = await base.balanceOf(join.address)
    console.log(`${await base.symbol()} - ${await pool.maturity()}`)
    console.log(`Pool base:               ${poolBaseReserves.toString().padStart(30, ' ')}`)
    console.log(`Pool redeemable fyToken: ${poolRedeemableFYToken.toString().padStart(30, ' ')}`)
    console.log(`Join base reserves:      ${joinReserves.toString().padStart(30, ' ')}`)
    console.log(`\n`)
  }
})()
