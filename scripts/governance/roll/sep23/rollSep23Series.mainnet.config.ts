import { FRAX, FYFRAX2309, USDT, YSFRAX6MMS } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { ONEUSDC } from '../../../../shared/constants'
import { FYUSDT2309, YSUSDT6MMS } from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers
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

export const ONEFRAX = ONEUSDC

const frax = base_config.bases.get(FRAX)!
const fraxIlks = base_config.ilks.get(FRAX)!

const fyFRAX2309: Series = {
  seriesId: FYFRAX2309,
  base: frax,
  fyToken: {
    assetId: FYFRAX2309,
    address: fyTokens.getOrThrow(FYFRAX2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYFRAX2309,
    address: pools.getOrThrow(FYFRAX2309)!,
  },
  ilks: fraxIlks,
}

export const newSeries: Series[] = [fyFRAX2309]

const ysFRAX6MMS: Strategy = {
  assetId: YSFRAX6MMS,
  address: strategyAddresses.getOrThrow(YSFRAX6MMS)!,
  base: frax,
  seriesToInvest: fyFRAX2309,
}

export const rollStrategies: Strategy[] = [ysFRAX6MMS]
