import { USDC } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { FYUSDC2309 } from '../../../../shared/constants'
import { YSUSDC6MMS, YSUSDC6MMS_V1 } from '../../../../shared/constants'

import * as base_config from '../../base.arb_mainnet.config'

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

import { Series, Strategy, Strategy_V1 } from '../../confTypes'

const usdc = base_config.bases.get(USDC)!
const usdcIlks = base_config.ilks.get(USDC)!

const fyUSDC2309: Series = {
  seriesId: FYUSDC2309,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2309,
    address: fyTokens.getOrThrow(FYUSDC2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2309,
    address: pools.getOrThrow(FYUSDC2309)!,
  },
  ilks: usdcIlks,
}

const ysUSDC6MMS: Strategy = {
  assetId: YSUSDC6MMS,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  base: usdc,
  seriesToInvest: fyUSDC2309,
}

const ysUSDC6MMSV1: Strategy_V1 = {
  assetId: YSUSDC6MMS_V1,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS_V1)!,
  base: usdc,
  seriesToInvest: ysUSDC6MMS,
}

export const oldStrategies: Strategy_V1[] = [ysUSDC6MMSV1]
export const newStrategies: Strategy[] = [ysUSDC6MMS]
export const rollStrategies = oldStrategies
