import { ethers } from 'hardhat'
import { getName } from '../shared/helpers'
import { Pool__factory } from '../typechain';
import { ERC20__factory } from '../typechain';

const pools: Map<string, string> = new Map([
  [
    "0x0030FF00028C",
    "0x60995D90B45169eB04F1ea9463443a62B83ab1c1"
  ],
  [
    "0x0031FF00028C",
    "0x1488646B72A188C82e0B35E0c28A3183E663e93f"
  ],
  [
    "0x0032FF00028C",
    "0x9d9DcF0035dB75F822A90a1d411aeB49F3ffc384"
  ],
  [
    "0x00A0FF00028C",
    "0x8b5875837679DF564CAf260266a466Cce12F350f"
  ],
  [
    "0x0030FF00028E",
    "0xd06b8a687eB30cb6EE6410655d361cfB87F6b6da"
  ],
  [
    "0x0031FF00028E",
    "0x4BDD8761e730C6523562a011FD799b019BD46dfb"
  ],
  [
    "0x0032FF00028E",
    "0xBB5d1466bb671BE9b8Ff0f10Bcb761C386694600"
  ],
  [
    "0x00A0FF00028E",
    "0x34Cce6324576b9d31E01c36303CFb9438dc0AB76"
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
