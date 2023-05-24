import { ethers } from 'hardhat'
import { getName } from '../shared/helpers'
import { Pool__factory } from '../typechain';
import { ERC20__factory } from '../typechain';

const pools: Map<string, string> = new Map([
  [
    "0x0030FF00028B",
    "0x2769ABE33010c710e24eA6aF8A2683C630BbD7D0"
  ],
  [
    "0x0031FF00028B",
    "0x02DbfAca22DF7e86897aDF65eb74188D79DAbeA6"
  ],
  [
    "0x0032FF00028B",
    "0x536edc2a3dB3BFE558Cae74cEDCcD30F07F7121b"
  ],
  [
    "0x00A0FF00028B",
    "0xc6078e090641cC32b05a7F3F102F272A4Ee19867"
  ],
  [
    "0x0030FF00028E",
    "0x3EA4618cE652eaB330F00935FD075F5Cb614e689"
  ],
  [
    "0x0031FF00028E",
    "0x9a364e874258D6B76091D928ce69512Cd905EE68"
  ],
  [
    "0x0032FF00028E",
    "0xa98F3211997FDB072B6a8E2C2A26C34BC447f873"
  ],
  [
    "0x00A0FF00028E",
    "0xf0bA5Cf116321A89b35b2d146aE5B861Bd9c23D3"
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
