import { BigNumber } from 'ethers'
import { ZERO, ZERO_ADDRESS, WAD, ONEUSDC, ONE64, secondsInOneYear, DEC6 } from '../../../../../shared/constants'
import { ETH, ETH, USDC, EETH, EUSDC } from '../../../../../shared/constants'
import { EODEC22 } from '../../../../../shared/constants'
import { FYETH2212, FYUSDC2212 } from '../../../../../shared/constants'
import { YSETH6MJD, YSUSDC6MJD } from '../../../../../shared/constants'
import { COMPOUND, ACCUMULATOR } from '../../../../../shared/constants'
import * as base_config from '../../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
// export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
// export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const strategies: Map<string, string> = base_config.strategies
export const fyTokens: Map<string, string> = base_config.fyTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

// Time stretch to be set in the PoolFactory prior to pool deployment
export const timeStretch: Map<string, BigNumber> = new Map([[FYETH2212, ONE64.div(secondsInOneYear.mul(25))]])

// Sell base to the pool fee, as fp4
export const g1: number = 9000

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYETH2212, ETH, protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string, EODEC22, 'FYETH2212', 'FYETH2212'],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee)
export const nonTVPoolData: Array<[string, string, string, BigNumber, number]> = [
  [
    FYETH2212,
    assets.get(ETH) as string,
    fyTokens.get(FYETH2212) as string,
    timeStretch.get(FYETH2212) as BigNumber,
    g1,
  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYETH2212, ETH, WAD.div(100), BigNumber.from('0')],
]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [[FYETH2212, [ETH, ETH, USDC]]]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy ETH 6M Jun Dec', YSETH6MJD, ETH],
]

// Input data
export const strategiesInit: Array<[string, string, string, BigNumber]> = [
  // [strategyId, startPoolAddress, startPoolId, initAmount]
  [YSETH6MJD, newPools.get(FYETH2212) as string, FYETH2212, WAD.div(100)],
]
