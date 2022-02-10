import { BigNumber } from 'ethers'
import {
  COMPOUND,
  CHI,
  DAI,
  EOJUN22,
  EOMAR22,
  ETH,
  FYETH2203,
  FYETH2206,
  ONE64,
  RATE,
  secondsIn25Years,
  USDC,
  WBTC,
  LINK,
  WSTETH,
  ENS,
  WAD,
  YSETH6MJD,
  YSETH6MMS,
  ZERO,
} from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const rateChiSources: Array<[string, string, string, string]> = [
  [ETH, RATE, WAD.toString(), WAD.toString()],
  [ETH, CHI, WAD.toString(), WAD.toString()],
]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [[ETH, base_config.joins.get(ETH) as string]]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, DAI, 1400000, 1000000000, 1250000, 12],
  [ETH, USDC, 1400000, 1000000000, 1250000, 12],
  [ETH, ETH, 1000000, 2500000000, 0, 12], // Constant 1, no dust
]

export const newChiSources: Array<[string, string]> = [
  [ETH, '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'],
]

export const newRateSources: Array<[string, string]> = [
  [ETH, '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'],
]


// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const newChainlinkLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, ETH, 1000000, 2500000000, 0, 12], // Constant 1, no dust
  [ETH, DAI, 1500000, 250000000, 10000, 12],
  [ETH, USDC, 1500000, 250000000, 10000, 12],
  [ETH, WBTC, 1500000, 250000000, 10000, 12],
  [ETH, LINK, 1500000, 250000000, 10000, 12],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const newCompositeLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, WSTETH, 1000000, 250000000, 10000, 12],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const newUniswapLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, ENS, 1500000, 250000000, 10000, 12],
]


// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [
    FYETH2203,
    ETH,
    base_config.protocol.get(COMPOUND) as string,
    base_config.joins.get(ETH) as string,
    EOMAR22,
    'FYETH2203',
    'FYETH2203',
  ],
  [
    FYETH2206,
    ETH,
    base_config.protocol.get(COMPOUND) as string,
    base_config.joins.get(ETH) as string,
    EOJUN22,
    'FYETH2206',
    'FYETH2206',
  ],
]

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYETH2203,
    base_config.assets.get(ETH) as string,
    base_config.newFYTokens.get(FYETH2203) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYETH2206,
    base_config.assets.get(ETH) as string,
    base_config.newFYTokens.get(FYETH2206) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYETH2203, ETH, WAD.div(40), ZERO],
  [FYETH2206, ETH, WAD.div(40), ZERO],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2203, [ETH, DAI, USDC]],
  [FYETH2206, [ETH, DAI, USDC]],
]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy ETH 6M Mar Sep', YSETH6MMS, ETH],
  ['Yield Strategy ETH 6M Jun Dec', YSETH6MJD, ETH],
]

// Input data
export const strategiesInit: Array<[string, string, BigNumber]> = [
  // [strategyId, startPoolId, initAmount]
  [YSETH6MMS, FYETH2203, WAD.div(40)],
  [YSETH6MJD, FYETH2206, WAD.div(40)],
]
