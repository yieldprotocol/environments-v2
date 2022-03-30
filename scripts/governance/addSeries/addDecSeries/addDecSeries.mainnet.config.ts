import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
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
  WAD,
  ONEUSDC,
  MAX256,
  ONE64,
  secondsIn30Years,
} from '../../../../shared/constants'
import { EODEC22, FYDAI2212, FYUSDC2212, YSDAI6MMS, YSUSDC6MMS, COMPOUND } from '../../../../shared/constants'

import * as base_config from '../../base.rinkeby.config'

export const chainId: number = base_config.chainId
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2212, DAI, protocol.get(COMPOUND) as string, joins.get(DAI) as string, EODEC22, 'FYDAI2212', 'FYDAI2212'],
  [FYUSDC2212, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EODEC22, 'FYUSDC2212', 'FYUSDC2212'],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYDAI2212,
    assets.get(DAI) as string,
    newFYTokens.get(FYDAI2212) as string,
    ONE64.div(secondsIn30Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYUSDC2212,
    assets.get(USDC) as string,
    newFYTokens.get(FYUSDC2212) as string,
    ONE64.div(secondsIn30Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, baseId, baseAmount, fyTokenAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYDAI2212, DAI, WAD.mul(100), BigNumber.from(0)],
  [FYUSDC2212, USDC, ONEUSDC.mul(100), BigNumber.from(0)],
]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC]],
]

// Parameters to roll each strategy
// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MMS, FYDAI2212, BigNumber.from(0), MAX256],
  [YSUSDC6MMS, FYUSDC2212, BigNumber.from(0), MAX256],
]
