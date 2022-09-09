import { ethers } from 'hardhat'

const pools = [
  "0x6BaC09a67Ed1e1f42c29563847F77c28ec3a04FC",
  "0xf5Fd5A9Db9CcCc6dc9f5EF1be3A859C39983577C",
  "0xc3348D8449d13C364479B1F114bcf5B73DFc0dc6",
  "0x4b32C37Be5949e77ba3726E863a030BD77942A97",
]

;(async () => {
  for (let poolAddress of pools) {
    const pool = (await ethers.getContractAt('Pool', poolAddress))
    const base = (await ethers.getContractAt('ERC20', await pool.base()))
    const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken()))
    const join = (await ethers.getContractAt('Join', await fyToken.join()))
  
    console.log(`${await base.symbol()}`)
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
