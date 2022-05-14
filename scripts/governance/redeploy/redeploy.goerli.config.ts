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
  FRAX,
  ACCUMULATOR,
  CHI,
  EOMAR23,
  FYFRAX2206,
  FYFRAX2209,
  RATE,
  YSFRAX6MJD,
  YSFRAX6MMS,
} from '../../../shared/constants'

import { YSDAI6MMS, YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../../shared/constants'

import * as base_config from '../base.goerli.config'

export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const newStrategies = readAddressMappingIfExists('newStrategies.json')
export const chainId = 42
export const developer: string = '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A'
export const deployer: string = '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A'
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const whales: Map<string, string> = base_config.whales
export const assets: Map<string, string> = base_config.assets
export const chiSources: Array<[string, string]> = base_config.chiSources
export const rateSources: Array<[string, string]> = base_config.rateSources
export const chainlinkSources: Array<[string, string, string, string, string]> = base_config.chainlinkSources

export const additionalDevelopers: Array<string> = []
export const additionalGovernors: Array<string> = [
  '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A',
  '0xE7aa7AF667016837733F3CA3809bdE04697730eF',
  '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5',
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Kovan

// The lidoSource is the wstETH contract
export const lidoSource = assets.get(WSTETH) as string

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [[USDC, YVUSDC, assets.get(YVUSDC) as string]]

export const compositeSources: Array<[string, string, string]> = base_config.compositeSources

export const compositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
  [WSTETH, ETH, [STETH]],
  [ENS, DAI, [ETH]],
  [ENS, USDC, [ETH]],
]

export const rateChiSources: Array<[string, string, string, string]> = [
  [FRAX, RATE, WAD.toString(), WAD.toString()],
  [FRAX, CHI, WAD.toString(), WAD.toString()],
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
  [FRAX, protocol.get('fraxMock') as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [[STETH, assets.get(STETH) as string]]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [ETH, newJoins.get(ETH) as string],
  [DAI, newJoins.get(DAI) as string],
  [USDC, newJoins.get(USDC) as string],
]

// Assets that will be made into a base with lending rate from accumulator
export const accumulatorBases: Array<[string, string]> = [[FRAX, newJoins.get(FRAX) as string]]

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
  [FRAX, FRAX, 1000000, 5000000, 0, 18],
  [FRAX, ETH, 1400000, 1000000, 5000, 18],
  [FRAX, DAI, 1100000, 1000000, 5000, 18],
  [FRAX, USDC, 1100000, 1000000, 5000, 18],
  [FRAX, WBTC, 1500000, 1000000, 5000, 18],
  [FRAX, LINK, 1670000, 1000000, 5000, 18],
  [FRAX, UNI, 1670000, 1000000, 5000, 18],
  [DAI, FRAX, 1100000, 100000, 5000, 18],
  [USDC, FRAX, 1100000, 100000, 5000, 6],
  [ETH, FRAX, 1400000, 1000000, 5000, 12],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const compositeDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, WSTETH, 1000000, 250000000, 10000, 12],
  [DAI, WSTETH, 1400000, 500000, 5000, 18],
  [USDC, WSTETH, 1400000, 500000, 5000, 6],
  [DAI, ENS, 1670000, 2000000, 5000, 18],
  [USDC, ENS, 1670000, 2000000, 5000, 6],
  [FRAX, WSTETH, 1400000, 1000000, 5000, 18],
  [FRAX, ENS, 1670000, 1000000, 5000, 18],
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
  [FRAX, 3600, 1000000, 1000000, 5000, 18],
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
  [
    FYFRAX2209,
    FRAX,
    protocol.get(ACCUMULATOR) as string,
    newJoins.get(FRAX) as string,
    EOSEP22,
    'FYFRAX2209',
    'FYFRAX2209',
  ],
  [
    FYFRAX2206,
    FRAX,
    protocol.get(ACCUMULATOR) as string,
    newJoins.get(FRAX) as string,
    EOMAR23,
    'FYFRAX2206',
    'FYFRAX2206',
  ],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2206, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYDAI2206, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2206, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
  [FYETH2209, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYDAI2209, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2209, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
  [FYFRAX2209, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYFRAX2206, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
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
  [
    FYFRAX2209,
    protocol.get('fraxMock') as string,
    newFYTokens.get(FYFRAX2209) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYFRAX2206,
    protocol.get('fraxMock') as string,
    newFYTokens.get(FYFRAX2206) as string,
    ONE64.div(secondsIn40Years),
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
  [FYFRAX2209, FRAX, WAD, ZERO],
  [FYFRAX2206, FRAX, WAD, ZERO],
]

export const strategiesData: Array<[string, string, string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy ETH 6M Mar Sep', YSETH6MMS, ETH, newJoins.get(ETH) as string, assets.get(ETH) as string],
  ['Yield Strategy ETH 6M Jun Dec', YSETH6MJD, ETH, newJoins.get(ETH) as string, assets.get(ETH) as string],
  ['Yield Strategy DAI 6M Mar Sep', YSDAI6MMS, DAI, newJoins.get(DAI) as string, assets.get(DAI) as string],
  ['Yield Strategy DAI 6M Jun Dec', YSDAI6MJD, DAI, newJoins.get(DAI) as string, assets.get(DAI) as string],
  ['Yield Strategy USDC 6M Mar Sep', YSUSDC6MMS, USDC, newJoins.get(USDC) as string, assets.get(USDC) as string],
  ['Yield Strategy USDC 6M Jun Dec', YSUSDC6MJD, USDC, newJoins.get(USDC) as string, assets.get(USDC) as string],
  [
    'Yield Strategy FRAX 6M Mar Sep',
    YSFRAX6MMS,
    FRAX,
    newJoins.get(FRAX) as string,
    protocol.get('fraxMock') as string,
  ],
  [
    'Yield Strategy FRAX 6M Jun Dec',
    YSFRAX6MJD,
    FRAX,
    newJoins.get(FRAX) as string,
    protocol.get('fraxMock') as string,
  ],
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
  [YSFRAX6MMS, newPools.get(FYFRAX2209) as string, FYFRAX2209, WAD],
  [YSFRAX6MJD, newPools.get(FYFRAX2206) as string, FYFRAX2206, WAD],
]

// decimal, baseId, quoteId, aggregator set
export const chainLinkAnswers: Array<[number, string, string]> = [
  [18, DAI, '341800000000000'],
  [18, USDC, '341447981529958'],
  [18, WBTC, '13581728000000000000'],
  [18, STETH, '13581728000000000000'],
  [18, LINK, '4353800658981643'],
  [18, ENS, '14698870000000000'],
  [18, UNI, '2850020000000000'],
]
