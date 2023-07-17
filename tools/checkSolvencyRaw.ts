import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { getName } from '../shared/helpers'
import { ERC20__factory, Join__factory, Ladle__factory, Solvency__factory } from '../typechain';
import { LADLE, SOLVENCY, STRATEGY_RESCUE, ZERO_ADDRESS } from '../shared/constants'

const { protocol, fyTokens, joins } = require(process.env.CONF as string)

const seriesIds: Array<string> = new Array(
//  "0x303030390000",
//  "0x303130390000",
//  "0x303230390000",
//  "0x313830390000",
//  "0x00A0FF000288",

  "0x0030FF00028B",
  "0x0031FF00028B",
  "0x0032FF00028B",
  "0x0138FF00028B",
  "0x00A0FF00028B",

//  "0x0030FF00028C",
//  "0x0031FF00028C",
//  "0x0032FF00028C",
//  "0x00A0FF00028C",

  "0x0030FF00028E",
  "0x0031FF00028E",
  "0x0032FF00028E",
  "0x00A0FF00028E",
  "0x0138FF00028E",
)

const assetIds: Array<string> = new Array(
    "0x303000000000",
    "0x303100000000",
    "0x303200000000",
    "0x303300000000",
    "0x303400000000",
    "0x303600000000",
    "0x303700000000",
    "0x303900000000",
    "0x313000000000",
    "0x313200000000",
    "0x313300000000",
    "0x313400000000",
    "0x313500000000",
    "0x313600000000",
    "0x313700000000",
    "0x313800000000",
    "0x333000000000",
    "0x333100000000",
    "0x333200000000",
    "0x333300000000",
    "0x333400000000",
    "0x333500000000",
    "0x323300000000",
    "0x323400000000",
    "0x323500000000",
    "0x323600000000",
    "0x323800000000",
    "0x323900000000",
    "0x333800000000",
    "0x303030380000",
    "0x303030390000",
    "0x303130380000",
    "0x303130390000",
    "0x303230380000",
    "0x303230390000",
    "0x313830380000",
    "0x313830390000",
    "0x40301200028B",
    "0x40311200028B",
    "0x40321200028B",
    "0xE03016000000",
    "0x30A000000000",
    "0x40311700028C",
    "0x40301200028E",
    "0x40311200028E",
    "0x40321200028E",
    "0x403012000291",
    "0x403112000291",
    "0x403212000291",
)


;(async () => {
  console.log(`ASSETS`)
  for (let assetId of assetIds) {
    let amount: string

    const joinAddress = joins.get(assetId)
    if (joinAddress === undefined || joinAddress === ZERO_ADDRESS) continue

    const join = Join__factory.connect(joinAddress, ethers.provider)
    amount = (await join.storedBalance()).toString()
    if (amount !== '0') console.log(`${getName(assetId)} ${amount}`)
  }

  console.log(`\n`)

  console.log(`LIABILITIES`)
  for (let seriesId of seriesIds) {
    const fyTokenAddress = fyTokens.get(seriesId)
    if (fyTokenAddress === undefined || fyTokenAddress === ZERO_ADDRESS) continue

    const fyToken = ERC20__factory.connect(fyTokens.getOrThrow(seriesId), ethers.provider)
    let amount: string
    try {
      // We accidentally minted more 2306B and 2309 FYTokens than we should have, locked in the StrategyRescue contract, so we need to subtract them from the total supply
      // Until the total supply of 2309 fyToken is reduced, we need to calculate the value of those liabilities manually
      amount = (await fyToken.totalSupply()).sub(await fyToken.balanceOf(protocol.getOrThrow(STRATEGY_RESCUE))).toString()
    } catch (e) {
      amount = (await fyToken.totalSupply()).toString()
    }
    if (amount !== '0') console.log(`${getName(seriesId)} ${fyTokens.getOrThrow(seriesId)} ${amount}`)
  }
})()
