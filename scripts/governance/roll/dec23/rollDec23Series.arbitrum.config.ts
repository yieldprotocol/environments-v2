import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { ONEUSDC } from '../../../../shared/constants'
import { FYETH2312, FYDAI2312, FYUSDC2312, FYUSDT2312, YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSUSDT6MJD } from '../../../../shared/constants'

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

import { Series, Strategy } from '../../confTypes'

export const ONEUSDT = ONEUSDC

const eth = base_config.bases.get(ETH)!
const ethIlks = base_config.ilks.get(ETH)!
const dai = base_config.bases.get(DAI)!
const daiIlks = base_config.ilks.get(DAI)!
const usdc = base_config.bases.get(USDC)!
const usdcIlks = base_config.ilks.get(USDC)!
const usdt = base_config.bases.get(USDT)!
const usdtIlks = base_config.ilks.get(USDT)!

const fyETH2312: Series = {
  seriesId: FYETH2312,
  base: eth,
  fyToken: {
    assetId: FYETH2312,
    address: fyTokens.getOrThrow(FYETH2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2312,
    address: pools.getOrThrow(FYETH2312)!,
  },
  ilks: ethIlks,
}

const fyDAI2312: Series = {
  seriesId: FYDAI2312,
  base: dai,
  fyToken: {
    assetId: FYDAI2312,
    address: fyTokens.getOrThrow(FYDAI2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2312,
    address: pools.getOrThrow(FYDAI2312)!,
  },
  ilks: daiIlks,
}

const fyUSDC2312: Series = {
  seriesId: FYUSDC2312,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2312,
    address: fyTokens.getOrThrow(FYUSDC2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2312,
    address: pools.getOrThrow(FYUSDC2312)!,
  },
  ilks: usdcIlks,
}

const fyUSDT2312: Series = {
  seriesId: FYUSDT2312,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2312,
    address: fyTokens.getOrThrow(FYUSDT2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2312,
    address: pools.getOrThrow(FYUSDT2312)!,
  },
  ilks: usdtIlks,
}

export const newSeries: Series[] = [fyETH2312, fyDAI2312, fyUSDC2312, fyUSDT2312]

const ysETH6MJD: Strategy = {
  assetId: YSETH6MJD,
  address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  base: eth,
  seriesToInvest: fyETH2312,
}

const ysDAI6MJD: Strategy = {
  assetId: YSDAI6MJD,
  address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  base: dai,
  seriesToInvest: fyDAI2312,
}

const ysUSDC6MJD: Strategy = {
  assetId: YSUSDC6MJD,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  base: usdc,
  seriesToInvest: fyUSDC2312,
}

const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  base: usdt,
  seriesToInvest: fyUSDT2312,
}

export const rollStrategies: Strategy[] = [ysETH6MJD, ysDAI6MJD, ysUSDC6MJD, ysUSDT6MJD]
