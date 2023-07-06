import { ethers } from 'hardhat'
import { getName } from '../shared/helpers'
import { Pool__factory } from '../typechain';
import { ERC20__factory } from '../typechain';

const pools: Map<string, string> = new Map([
  [
    "0x0030FF000291",
    "0x2fa05b91011c4FE1CC65D56ee76235c13625891d"
  ],
  [
    "0x0031FF000291",
    "0x6e3Ad3b8f00eFB63A6bDe720AE73eD57ca75eB9e"
  ],
  [
    "0x0032FF000291",
    "0x7Eb7dBDefb0810156293EdCf692DA0471f3af54f"
  ],
  [
    "0x00A0FF000291",
    "0xB31cCF0fA909A67f491aDf58C3B07843c9854A81"
  ]
])


;(async () => {
  for (let [seriesId, poolAddress] of pools) {

    const pool = Pool__factory.connect(poolAddress, ethers.provider)
    const base = ERC20__factory.connect(await pool.base(), ethers.provider)
    const fyToken = ERC20__factory.connect(await pool.fyToken(), ethers.provider)
    // Instantiate base and fyToken
    console.log(`Pool: ${pool.address}`)

    const poolTotalSupply = await pool.totalSupply()
    const poolCache = await pool.getCache()
    const poolBase = poolCache[0]
//    const poolAvailableBase = (await base.balanceOf(poolAddress)).sub(poolBase)
    const poolFYToken = poolCache[1].sub(poolTotalSupply)
//    const poolAvailableFYToken = (await fyToken.balanceOf(poolAddress)).sub(poolFYToken)
    const ratio = poolFYToken.isZero() ? 0 : poolBase.mul(1000000).div(poolFYToken)
//    const mintRatio = poolAvailableFYToken.isZero() ? 0 : poolAvailableBase.mul(1000000).div(poolAvailableFYToken)
//    const poolMaximumFYToken = ratio === 0 ? 0 : poolAvailableBase.mul(1000000).div(ratio)

    console.log(`Series: ${getName(seriesId)}`)
    console.log(`Pool total supply:       ${poolTotalSupply}`)
    console.log(`Pool cached base:        ${poolBase}`)
//    console.log(`Pool available base:     ${poolAvailableBase}`)
    console.log(`Pool cached fyToken:     ${poolFYToken}`)
//    console.log(`Pool available fyToken:  ${poolAvailableFYToken}`)
//    console.log(`Pool maximum fyToken:    ${poolMaximumFYToken}`)
    console.log(`Pool ratio:              ${ratio}`)
//    console.log(`Pool mint ratio:         ${mintRatio}`)
    console.log(`\n`)
  }
})()
