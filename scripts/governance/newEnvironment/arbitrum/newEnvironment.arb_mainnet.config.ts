import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC } from '../../../../shared/constants'
import { ACCUMULATOR, RATE, CHI } from '../../../../shared/constants'
import { FYDAI2203, FYUSDC2203, FYDAI2206, FYUSDC2206, EOMAR22, EOJUN22 } from '../../../../shared/constants'
import { YSDAI6MMS, YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD } from '../../../../shared/constants'
import { WAD, ZERO, ONEUSDC, ONE64, secondsIn25Years } from '../../../../shared/constants'

import * as base_config from '../base.arb_mainnet.config'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

export const chainId = 42161
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const additionalDevelopers: Array<string> = [
  '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB',
  '0xfe90d993367bc93D171A5ED88ab460759DE2bED6',
  '0xC7aE076086623ecEA2450e364C838916a043F9a8',
]
export const additionalGovernors: Array<string> = []
export const whales: Map<string, string> = new Map([
  [DAI, '0xa5a33ab9063395a90ccbea2d86a62eccf27b5742'],
  [USDC, '0xba12222222228d8ba445958a75a0704d566bf2c8'],
])

export const rateChiSources: Array<[string, string, string, string]> = [
  [DAI, RATE, WAD.toString(), WAD.toString()],
  [USDC, RATE, WAD.toString(), WAD.toString()],
  [DAI, CHI, WAD.toString(), WAD.toString()],
  [USDC, CHI, WAD.toString(), WAD.toString()],
]

export const sequencerFlags: string = '0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83'

export const chainlinkUSDSources: Array<[string, string, string]> = [
  [ETH, assets.get(ETH) as string, '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612'],
  [DAI, assets.get(DAI) as string, '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB'],
  [USDC, assets.get(USDC) as string, '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3'],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH, assets.get(ETH) as string],
  [DAI, assets.get(DAI) as string],
  [USDC, assets.get(USDC) as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = []

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, newJoins.get(DAI) as string],
  [USDC, newJoins.get(USDC) as string],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, ETH, 1400000, 1000000, 100, 18],
  [DAI, DAI, 1000000, 10000000, 0, 18], // Constant 1, no dust
  [DAI, USDC, 1330000, 100000, 100, 18], // Via ETH
  [USDC, ETH, 1400000, 5000000, 100, 6],
  [USDC, DAI, 1330000, 100000, 100, 6], // Via ETH
  [USDC, USDC, 1000000, 10000000, 0, 6], // Constant 1, no dust
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH, 3600, 714000, 3250000000, 30000, 12],
  [DAI, 3600, 751000, 1000000, 100, 18],
  [USDC, 3600, 751000, 1000000, 100, 6],
]

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2203, DAI, protocol.get(ACCUMULATOR) as string, newJoins.get(DAI) as string, EOMAR22, 'FYDAI2203', 'FYDAI2203'],
  [
    FYUSDC2203,
    USDC,
    protocol.get(ACCUMULATOR) as string,
    newJoins.get(USDC) as string,
    EOMAR22,
    'FYUSDC2203',
    'FYUSDC2203',
  ],
  [FYDAI2206, DAI, protocol.get(ACCUMULATOR) as string, newJoins.get(DAI) as string, EOJUN22, 'FYDAI2206', 'FYDAI2206'],
  [
    FYUSDC2206,
    USDC,
    protocol.get(ACCUMULATOR) as string,
    newJoins.get(USDC) as string,
    EOJUN22,
    'FYUSDC2206',
    'FYUSDC2206',
  ],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203, [ETH, DAI, USDC]],
  [FYUSDC2203, [ETH, DAI, USDC]],
  [FYDAI2206, [ETH, DAI, USDC]],
  [FYUSDC2206, [ETH, DAI, USDC]],
]

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYDAI2203,
    assets.get(DAI) as string,
    newFYTokens.get(FYDAI2203) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYUSDC2203,
    assets.get(USDC) as string,
    newFYTokens.get(FYUSDC2203) as string,
    ONE64.div(secondsIn25Years),
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
]

// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYDAI2203, DAI, WAD.mul(100), ZERO],
  [FYUSDC2203, USDC, ONEUSDC.mul(100), ZERO],
  [FYDAI2206, DAI, WAD.mul(100), ZERO],
  [FYUSDC2206, USDC, ONEUSDC.mul(100), ZERO],
]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy DAI 6M Mar Sep', YSDAI6MMS, DAI],
  ['Yield Strategy DAI 6M Jun Dec', YSDAI6MJD, DAI],
  ['Yield Strategy USDC 6M Mar Sep', YSUSDC6MMS, USDC],
  ['Yield Strategy USDC 6M Jun Dec', YSUSDC6MJD, USDC],
]

// Input data
export const strategiesInit: Array<[string, string, BigNumber]> = [
  // [strategyId, startPoolId, initAmount]
  [YSDAI6MMS, FYDAI2203, WAD.mul(99)],
  [YSDAI6MJD, FYDAI2206, WAD.mul(99)],
  [YSUSDC6MMS, FYUSDC2203, ONEUSDC.mul(99)],
  [YSUSDC6MJD, FYUSDC2206, ONEUSDC.mul(99)],
]
