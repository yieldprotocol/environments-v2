import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../shared/helpers'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  STETH,
  LINK,
  ENS,
  UNI,
  YVUSDC,
  COMPOUND,
  EOJUN22,
  EOSEP22,
  FYDAI2206,
  FYDAI2209,
  FYETH2206,
  FYETH2209,
  FYUSDC2206,
  FYUSDC2209,
  ONE64,
  secondsIn25Years,
  secondsIn40Years,
  YSETH6MJD,
  YSETH6MMS,
  ZERO,
} from '../../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP } from '../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, EODEC21, EOMAR22 } from '../../../shared/constants'
import { YSDAI6MMS, YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../../shared/constants'

import * as base_config from '../base.rinkeby.config'

export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const chainId = 42
export const developer: string = '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A'
export const deployer: string = '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A'
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const whales: Map<string, string> = base_config.whales
export const additionalDevelopers: Array<string> = []
export const additionalGovernors: Array<string> = [
  '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A',
  '0xE7aa7AF667016837733F3CA3809bdE04697730eF',
  '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5',
]
export const assets: Map<string, string> = new Map([
  [ETH, '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
  [DAI, '0xaFCdc724EB8781Ee721863db1B15939675996484'],
  [USDC, '0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D'],
  [WBTC, '0xD5FafCE68897bdb55fA11Dd77858Df7a9a458D92'],
  [WSTETH, '0xC55a98C1b3B0942883bB37df9716bea42d7d5009'],
  [STETH, '0xD516492bb58F07bc91c972DCCB2DF654653d4D33'],
  [LINK, '0xB62FCB2ef1d1819aED135F567859b080ddFe1008'],
  [ENS, '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  [UNI, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  [YVUSDC, '0x3CFDf9646dBC385E47DC07869626Ea36BE7bA3a2'],
])

export const chiSources: Array<[string, string]> = [
  [DAI, '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
  [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  [ETH, '0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72'],
]

export const rateSources: Array<[string, string]> = [
  [DAI, '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
  [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  [ETH, '0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72'],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI, assets.get(DAI) as string, ETH, assets.get(ETH) as string, '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
  [USDC, assets.get(USDC) as string, ETH, assets.get(ETH) as string, '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
  [WBTC, assets.get(WBTC) as string, ETH, assets.get(ETH) as string, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, '0xd23BF69104cC640E68ebeE83B9833d6Db6F220E6'],
  [LINK, assets.get(LINK) as string, ETH, assets.get(ETH) as string, '0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38'],
  [ENS, assets.get(ENS) as string, ETH, assets.get(ETH) as string, '0x19d7cCdB7B4caE085d3Fda330A01D139d7243Be4'],
  [UNI, assets.get(UNI) as string, ETH, assets.get(ETH) as string, '0xC0E69E49D98D26D52f7505Af1dF8b3009168f945'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Kovan

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
  [
    FYUSDC2206,
    USDC,
    protocol.get(COMPOUND) as string,
    newJoins.get(USDC) as string,
    EOJUN22,
    'FYUSDC2206',
    'FYUSDC2206',
  ],
  [FYETH2206, ETH, protocol.get(COMPOUND) as string, newJoins.get(ETH) as string, EOJUN22, 'FYETH2206', 'FYETH2206'],
  [FYDAI2209, DAI, protocol.get(COMPOUND) as string, newJoins.get(DAI) as string, EOSEP22, 'FYDAI2209', 'FYDAI2209'],
  [
    FYUSDC2209,
    USDC,
    protocol.get(COMPOUND) as string,
    newJoins.get(USDC) as string,
    EOSEP22,
    'FYUSDC2209',
    'FYUSDC2209',
  ],
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
