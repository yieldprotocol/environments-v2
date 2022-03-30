import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI, YVUSDC } from '../../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP, COMPOUND, YEARN } from '../../../shared/constants'
import { FYETH2206, FYDAI2206, FYUSDC2206, FYETH2209, FYDAI2209, FYUSDC2209, EOJUN22, EOSEP22 } from '../../../shared/constants'
import { YSETH6MMS, YSDAI6MMS, YSUSDC6MMS, YSETH6MJD, YSDAI6MJD, YSUSDC6MJD } from '../../../shared/constants'
import { WAD, ONEUSDC, ZERO, ONE64, secondsIn25Years, secondsIn40Years } from '../../../shared/constants'

import * as base_config from '../base.rinkeby.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

export const additionalDevelopers: Array<string> = []
export const additionalGovernors: Array<string> = [
  '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A',
  '0xE7aa7AF667016837733F3CA3809bdE04697730eF',
  '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5',
]

export const chiSources: Array<[string, string]> = [
  [DAI, '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
  [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
]

export const rateSources: Array<[string, string]> = [
  [DAI, '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
  [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI, assets.get(DAI) as string, ETH, assets.get(ETH) as string, '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D'],
  [USDC, assets.get(USDC) as string, ETH, assets.get(ETH) as string, '0xdCA36F27cbC4E38aE16C4E9f99D39b42337F6dcf'],
  [WBTC, assets.get(WBTC) as string, ETH, assets.get(ETH) as string, '0x2431452A0010a43878bF198e170F6319Af6d27F4'],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, '0x17AEAA7aF619Cf60095528cB115fbE22F14dFA44'],
  [LINK, assets.get(LINK) as string, ETH, assets.get(ETH) as string, '0xFABe80711F3ea886C3AC102c81ffC9825E16162E'],
  [ENS, assets.get(ENS) as string, ETH, assets.get(ETH) as string, '0x64EB137E967D1788Ce653C4Bdd4E4aD708F50Ae6'],
  [UNI, assets.get(UNI) as string, ETH, assets.get(ETH) as string, '0x5E4FaE1eCCAc5a120e48cC02012aF1aeFF94dACc'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Rinkeby

// The lidoSource is the wstETH contract
export const lidoSource = assets.get(WSTETH) as string

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [[USDC, YVUSDC, assets.get(YVUSDC) as string]]

export const compositeSources: Array<[string, string, string]> = [
  [DAI, ETH, protocol.get(CHAINLINK) as string],
  [USDC, ETH, protocol.get(CHAINLINK) as string],
  [WBTC, ETH, protocol.get(CHAINLINK) as string],
  [STETH, ETH, protocol.get(CHAINLINK) as string],
  [WSTETH, STETH, protocol.get(LIDO) as string],
  [ENS, ETH, protocol.get(CHAINLINK) as string], // We don't use Uniswap on rinkeby
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
  [WSTETH, ETH, [STETH]],
  [ENS, DAI, [ETH]],
  [ENS, USDC, [ETH]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH, assets.get(ETH) as string],
  [DAI, assets.get(DAI) as string],
  [USDC, assets.get(USDC) as string],
  [WBTC, assets.get(WBTC) as string],
  [WSTETH, assets.get(WSTETH) as string],
  [LINK, assets.get(LINK) as string],
  [ENS, assets.get(ENS) as string],
  [UNI, assets.get(UNI) as string],
  [YVUSDC, assets.get(YVUSDC) as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [[STETH, assets.get(STETH) as string]]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [ETH, newJoins.get(ETH) as string],
  [DAI, newJoins.get(DAI) as string],
  [USDC, newJoins.get(USDC) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, ETH, 1000000, 2500000000, 0, 12], // Constant 1, no dust
  [ETH, DAI, 1500000, 250000000, 10000, 12],
  [ETH, USDC, 1500000, 250000000, 10000, 12],
  [ETH, WBTC, 1500000, 250000000, 10000, 12],
  [ETH, LINK, 1500000, 250000000, 10000, 12],
  [ETH, UNI, 1500000, 250000000, 10000, 12],
  [ETH, ENS, 1500000, 250000000, 10000, 12],
  [DAI, ETH, 1400000, 2000000, 5000, 18],
  [DAI, DAI, 1000000, 10000000, 0, 18], // Constant 1, no dust
  [DAI, USDC, 1330000, 100000, 5000, 18], // Via ETH
  [DAI, WBTC, 1500000, 100000, 5000, 18], // Via ETH
  [DAI, LINK, 1670000, 1000000, 5000, 18],
  [DAI, UNI, 1670000, 1000000, 5000, 18],
  [USDC, ETH, 1400000, 5000000, 5000, 6],
  [USDC, DAI, 1330000, 100000, 5000, 6], // Via ETH
  [USDC, USDC, 1000000, 10000000, 0, 6], // Constant 1, no dust
  [USDC, WBTC, 1500000, 100000, 5000, 6], // Via ETH
  [USDC, LINK, 1670000, 1000000, 5000, 6],
  [USDC, UNI, 1670000, 1000000, 5000, 6],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const compositeDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, WSTETH, 1000000, 250000000, 10000, 12],
  [DAI, WSTETH, 1400000, 500000, 5000, 18],
  [USDC, WSTETH, 1400000, 500000, 5000, 6],
  [DAI, ENS, 1670000, 2000000, 5000, 18],
  [USDC, ENS, 1670000, 2000000, 5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const newUniswapLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, ENS, 1500000, 250000000, 10000, 12],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const yearnDebtLimits: Array<[string, string, number, number, number, number]> = [
  [USDC, YVUSDC, 1250000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH, 3600, 714000, 500000000, 10000, 12],
  [DAI, 3600, 751000, 1000000, 5000, 18],
  [USDC, 3600, 751000, 1000000, 5000, 6],
  [WBTC, 3600, 666000, 300000, 2100, 4],
  [LINK, 3600, 600000, 1000000, 300, 18],
  [UNI, 3600, 600000, 1000000, 100, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const compositeAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [WSTETH, 3600, 714000, 500000, 10000, 12],
  [ENS, 3600, 600000, 2000000, 300, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
export const yearnAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [YVUSDC, 3600, 800000, 1000000, 5000, 18],
]

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2206, DAI, protocol.get(COMPOUND) as string, newJoins.get(DAI) as string, EOJUN22, 'FYDAI2206', 'FYDAI2206'],
  [FYUSDC2206, USDC, protocol.get(COMPOUND) as string, newJoins.get(USDC) as string, EOJUN22, 'FYUSDC2206', 'FYUSDC2206'],
  [FYETH2206, ETH, protocol.get(COMPOUND) as string, newJoins.get(ETH) as string, EOJUN22, 'FYETH2206', 'FYETH2206'],
  [FYDAI2209, DAI, protocol.get(COMPOUND) as string, newJoins.get(DAI) as string, EOSEP22, 'FYDAI2209', 'FYDAI2209'],
  [FYUSDC2209, USDC, protocol.get(COMPOUND) as string, newJoins.get(USDC) as string, EOSEP22, 'FYUSDC2209', 'FYUSDC2209'],
  [FYETH2209, ETH, protocol.get(COMPOUND) as string, newJoins.get(ETH) as string, EOSEP22, 'FYETH2209', 'FYETH2209'],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYDAI2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
  [FYETH2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYDAI2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
]

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYETH2206,
    assets.get(ETH) as string,
    newFYTokens.get(FYETH2206) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYDAI2206,
    assets.get(DAI) as string,
    newFYTokens.get(FYDAI2206) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYUSDC2206,
    assets.get(USDC) as string,
    newFYTokens.get(FYUSDC2206) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYETH2209,
    assets.get(ETH) as string,
    newFYTokens.get(FYETH2209) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYDAI2209,
    assets.get(DAI) as string,
    newFYTokens.get(FYDAI2209) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYUSDC2209,
    assets.get(USDC) as string,
    newFYTokens.get(FYUSDC2209) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYETH2206, ETH, WAD.div(50), ZERO],
  [FYDAI2206, DAI, WAD.mul(100), ZERO],
  [FYUSDC2206, USDC, ONEUSDC.mul(100), ZERO],
  [FYETH2209, ETH, WAD.div(50), ZERO],
  [FYDAI2209, DAI, WAD.mul(100), ZERO],
  [FYUSDC2209, USDC, ONEUSDC.mul(100), ZERO],
]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy ETH 6M Mar Sep', YSETH6MMS, ETH],
  ['Yield Strategy ETH 6M Jun Dec', YSETH6MJD, ETH],
  ['Yield Strategy DAI 6M Mar Sep', YSDAI6MMS, DAI],
  ['Yield Strategy DAI 6M Jun Dec', YSDAI6MJD, DAI],
  ['Yield Strategy USDC 6M Mar Sep', YSUSDC6MMS, USDC],
  ['Yield Strategy USDC 6M Jun Dec', YSUSDC6MJD, USDC],
]

// Input data
export const strategiesInit: Array<[string, string, string, BigNumber]> = [
  // [strategyId, startPoolAddress, startPoolId, initAmount]
  [YSETH6MMS, newPools.get(FYETH2209) as string, FYETH2209, WAD.div(50)],
  [YSETH6MJD, newPools.get(FYETH2206) as string, FYETH2206, WAD.div(50)],
  [YSDAI6MMS, newPools.get(FYDAI2209) as string, FYDAI2209, WAD.mul(100)],
  [YSDAI6MJD, newPools.get(FYDAI2206) as string, FYDAI2206, WAD.mul(100)],
  [YSUSDC6MMS, newPools.get(FYUSDC2209) as string, FYUSDC2209, ONEUSDC.mul(100)],
  [YSUSDC6MJD, newPools.get(FYUSDC2206) as string, FYUSDC2206, ONEUSDC.mul(100)],
]
