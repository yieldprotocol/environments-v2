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
    "0x0bdF152f6d899F4B63b9554ED98D9b9d22FFdee4"
  ],
  [
    "0x0032FF00028C",
    "0xaCd0523Aca72CC58EC2f3d4C14F5473FC11c5C2D"
  ],
  [
    "0x00A0FF00028C",
    "0x6E38B8d9dedd967961508708183678b4EC1B1E33"
  ],
  [
    "0x0030FF00028E",
    "0xE56c9c47b271A58e5856004952c5F4D34a78B99B"
  ],
  [
    "0x0031FF00028E",
    "0x9ce9c9f9fF417Ffc215A4e5c6b4e44BB76Cf8C79"
  ],
  [
    "0x0032FF00028E",
    "0xFCd1C61139F8Af13c5090CfBb2dD674a2Ff4fe35"
  ],
  [
    "0x00A0FF00028E",
    "0x0ECc79FE01b02548853c87466cCd57710bf9d11A"
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
