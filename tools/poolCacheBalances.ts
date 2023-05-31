import { ethers } from 'hardhat'
import { getName } from '../shared/helpers'
import { Pool__factory } from '../typechain';
import { ERC20__factory } from '../typechain';

const pools: Map<string, string> = new Map([
  [
    "0x0030FF00028B",
    "0x3e0a639c4a6D4d39a0DeAE07c228Ff080de55eeE"
  ],
  [
    "0x0030FF00028E",
    "0x54D47f765fA247AfEE226fDf919392CdaC6cbb2E"
  ],
  [
    "0x0031FF00028B",
    "0xB71dB5f70FE5Af728Db8C05930d48553E5a0eB98"
  ],
  [
    "0x0031FF00028E",
    "0xbc62d88182ffA86918d0129f5bD35Dea8df9213a"
  ],
  [
    "0x0032FF00028B",
    "0x530648558a27fe1d1BfC7356F67a34f4a7f06B6D"
  ],
  [
    "0x0032FF00028E",
    "0xf7F6eB1b097F60673e65347C83d83Cb4ade82a0B"
  ],
  [
    "0x00A0FF00028B",
    "0x7388f277441b3E1f3388f0464244e469fEA30e41"
  ],
  [
    "0x00A0FF00028E",
    "0x1EEc5ED8E01E0232F5ab2D70bB00231250aB2e7A"
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
