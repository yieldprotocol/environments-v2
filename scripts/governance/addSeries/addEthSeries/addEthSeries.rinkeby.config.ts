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
  secondsIn40Years,
  USDC,
  WBTC,
  LINK,
  STETH,
  WSTETH,
  ENS,
  WAD,
  YSETH6MJD,
  YSETH6MMS,
  ZERO,
} from '../../../../shared/constants'

import * as base_config from '../../base.rinkeby.config'

export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

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

export const newChiSources: Array<[string, string]> = [[ETH, '0xd6801a1dffcd0a410336ef88def4320d6df1883e']]

export const newRateSources: Array<[string, string]> = [[ETH, '0xd6801a1dffcd0a410336ef88def4320d6df1883e']]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const newChainlinkLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, ETH, 1000000, 2500000000, 0, 12], // Constant 1, no dust
  [ETH, DAI, 1500000, 250000000, 10000, 12],
  [ETH, USDC, 1500000, 250000000, 10000, 12],
  [ETH, WBTC, 1500000, 250000000, 10000, 12],
  [ETH, LINK, 1500000, 250000000, 10000, 12],
]

export const newCompositePaths: Array<[string, string, Array<string>]> = [[WSTETH, ETH, [STETH]]]

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
  [FYETH2203, ETH, protocol.get(COMPOUND) as string, joins.get(ETH) as string, EOMAR22, 'FYETH2203', 'FYETH2203'],
  [FYETH2206, ETH, protocol.get(COMPOUND) as string, joins.get(ETH) as string, EOJUN22, 'FYETH2206', 'FYETH2206'],
]

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYETH2203,
    assets.get(ETH) as string,
    newFYTokens.get(FYETH2203) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYETH2206,
    assets.get(ETH) as string,
    newFYTokens.get(FYETH2206) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYETH2203, ETH, WAD.div(50), ZERO],
  [FYETH2206, ETH, WAD.div(50), ZERO],
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
export const strategiesInit: Array<[string, string, string, BigNumber]> = [
  // [strategyId, startPoolAddress, startPoolId, initAmount]
  [YSETH6MMS, newPools.get(FYETH2203) as string, FYETH2203, WAD.div(50)],
  [YSETH6MJD, newPools.get(FYETH2206) as string, FYETH2206, WAD.div(50)],
]
