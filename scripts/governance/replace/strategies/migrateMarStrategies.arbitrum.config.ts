import { ETH, DAI, USDC } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { FYETH2309, FYDAI2309, FYUSDC2309, FYETH2309LP, FYDAI2309LP, FYUSDC2309LP } from '../../../../shared/constants'
import {
  YSETH6MMS,
  YSDAI6MMS,
  YSUSDC6MMS,
  YSETH6MMS_V1,
  YSDAI6MMS_V1,
  YSUSDC6MMS_V1,
} from '../../../../shared/constants'

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

import { Series, Strategy, Strategy_V1 } from '../../confTypes'

const eth = base_config.bases.get(ETH)!
const dai = base_config.bases.get(DAI)!
const usdc = base_config.bases.get(USDC)!
const ethIlks = base_config.ilks.get(ETH)!
const daiIlks = base_config.ilks.get(DAI)!
const usdcIlks = base_config.ilks.get(USDC)!

const fyETH2309: Series = {
  seriesId: FYETH2309,
  base: eth,
  fyToken: {
    assetId: FYETH2309,
    address: fyTokens.getOrThrow(FYETH2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2309LP,
    address: pools.getOrThrow(FYETH2309LP)!,
  },
  ilks: ethIlks,
}

const fyDAI2309: Series = {
  seriesId: FYDAI2309,
  base: dai,
  fyToken: {
    assetId: FYDAI2309,
    address: fyTokens.getOrThrow(FYDAI2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2309LP,
    address: pools.getOrThrow(FYDAI2309LP)!,
  },
  ilks: daiIlks,
}

const fyUSDC2309: Series = {
  seriesId: FYUSDC2309,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2309,
    address: fyTokens.getOrThrow(FYUSDC2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2309LP,
    address: pools.getOrThrow(FYUSDC2309LP)!,
  },
  ilks: usdcIlks,
}

export const newSeries: Series[] = [fyETH2309, fyDAI2309, fyUSDC2309]

const ysETH6MMS: Strategy = {
  assetId: YSETH6MMS,
  address: strategyAddresses.getOrThrow(YSETH6MMS)!,
  base: eth,
  seriesToInvest: fyETH2309,
}

const ysDAI6MMS: Strategy = {
  assetId: YSDAI6MMS,
  address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  base: dai,
  seriesToInvest: fyDAI2309,
}

const ysUSDC6MMS: Strategy = {
  assetId: YSUSDC6MMS,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  base: usdc,
  seriesToInvest: fyUSDC2309,
}

const ysETH6MMSV1: Strategy_V1 = {
  assetId: YSETH6MMS_V1,
  address: strategyAddresses.getOrThrow(YSETH6MMS_V1)!,
  base: eth,
  seriesToInvest: ysETH6MMS,
}

const ysDAI6MMSV1: Strategy_V1 = {
  assetId: YSDAI6MMS_V1,
  address: strategyAddresses.getOrThrow(YSDAI6MMS_V1)!,
  base: dai,
  seriesToInvest: ysDAI6MMS,
}

const ysUSDC6MMSV1: Strategy_V1 = {
  assetId: YSUSDC6MMS_V1,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS_V1)!,
  base: usdc,
  seriesToInvest: ysUSDC6MMS,
}

export const oldStrategies: Strategy_V1[] = [ysETH6MMSV1, ysDAI6MMSV1, ysUSDC6MMSV1]
export const newStrategies: Strategy[] = [ysETH6MMS, ysDAI6MMS, ysUSDC6MMS]
