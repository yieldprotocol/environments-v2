import { BigNumber } from 'ethers'
import {
  ACCUMULATOR,
  CHI,
  DAI,
  EOSEP22,
  EOMAR23,
  ETH,
  FYFRAX2209,
  FYFRAX2206,
  ONE64,
  RATE,
  secondsIn40Years,
  USDC,
  WBTC,
  LINK,
  STETH,
  WSTETH,
  ENS,
  UNI,
  FRAX,
  WAD,
  ZERO,
  CHAINLINK,
  YSFRAX6MJD,
  YSFRAX6MMS,
  FYDAI2206,
  FYDAI2209,
  FYETH2206,
  FYETH2209,
  FYUSDC2206,
  FYUSDC2209,
} from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.kovan.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A'
const basewhales: Map<string, string> = base_config.whales
export const whales: Map<string, string> = basewhales.set(FRAX, developer)
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
// export const joins: Map<string, string> = base_config.joins
// export const newFYTokens: Map<string, string> = base_config.newFYTokens
// export const newPools: Map<string, string> = base_config.newPools
// export const newStrategies: Map<string, string> = base_config.newStrategies
export const newJoins: Map<string, string> = readAddressMappingIfExists('newJoins.json')

export const rateChiSources: Array<[string, string, string, string]> = [
  [FRAX, RATE, WAD.toString(), WAD.toString()],
  [FRAX, CHI, WAD.toString(), WAD.toString()],
]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [[FRAX, newJoins.get(FRAX) as string]]

export const assetsToAdd: Map<string, string> = new Map([[FRAX, protocol.get('fraxMock') as string]])

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [FRAX, protocol.get('fraxMock') as string, ETH, assets.get(ETH) as string, protocol.get('fraxOracleMock') as string],
]

export const newChiSources: Array<[string, string]> = [[FRAX, protocol.get(ACCUMULATOR) as string]]

export const newRateSources: Array<[string, string]> = [[FRAX, protocol.get(ACCUMULATOR) as string]]

export const compositeSources: Array<[string, string, string]> = [
  [FRAX, ETH, protocol.get(CHAINLINK) as string],
  [UNI, ETH, protocol.get(CHAINLINK) as string],
  [LINK, ETH, protocol.get(CHAINLINK) as string],
  // [USDC, YVUSDC, protocol.get(YEARN) as string],
]

export const newCompositePaths: Array<[string, string, Array<string>]> = [
  [FRAX, ENS, [ETH]],
  [FRAX, WSTETH, [ETH, STETH]],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const newChainlinkLimits: Array<[string, string, number, number, number, number]> = [
  [FRAX, FRAX, 1000000, 5000000, 5000, 18],
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
export const newCompositeLimits: Array<[string, string, number, number, number, number]> = [
  [FRAX, WSTETH, 1400000, 1000000, 5000, 18],
  [FRAX, ENS, 1670000, 1000000, 5000, 18],
]

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
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

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
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
  [FYFRAX2209, FRAX, WAD, ZERO],
  [FYFRAX2206, FRAX, WAD, ZERO],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYFRAX2209, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYFRAX2206, [FRAX, ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYETH2206, [FRAX]],
  [FYDAI2206, [FRAX]],
  [FYUSDC2206, [FRAX]],
  [FYETH2209, [FRAX]],
  [FYDAI2209, [FRAX]],
  [FYUSDC2209, [FRAX]],
]

export const strategiesData: Array<[string, string, string, string, string]> = [
  // name, symbol, baseId
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
  [YSFRAX6MMS, newPools.get(FYFRAX2209) as string, FYFRAX2209, WAD],
  [YSFRAX6MJD, newPools.get(FYFRAX2206) as string, FYFRAX2206, WAD],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [FRAX, 3600, 1000000, 1000000, 5000, 18],
]
