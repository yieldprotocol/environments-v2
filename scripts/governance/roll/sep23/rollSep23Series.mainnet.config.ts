import { USDT } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { ONEUSDC } from '../../../../shared/constants'
import { FYUSDT2309, FYUSDT2309LP, YSUSDT6MMS } from '../../../../shared/constants'

import * as base_config from '../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategyAddresses: Map<string, string> = base_config.strategyAddresses

export const series: Map<string, Series> = base_config.series
export const strategies: Map<string, Strategy> = base_config.strategies

import { Series, Strategy } from '../../confTypes'

export const ONEUSDT = ONEUSDC

const usdt = base_config.bases.get(USDT)!
const usdtIlks = base_config.ilks.get(USDT)!

const fyUSDT2309: Series = {
  seriesId: FYUSDT2309,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2309,
    address: fyTokens.getOrThrow(FYUSDT2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2309LP,
    address: pools.getOrThrow(FYUSDT2309LP)!,
  },
  ilks: usdtIlks,
}

export const newSeries: Series[] = [fyUSDT2309]

const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
  seriesToInvest: fyUSDT2309,
}

export const rollStrategies: Strategy[] = [ysUSDT6MMS]
