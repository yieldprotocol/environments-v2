import { ethers } from 'hardhat'
import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { FYETH2306B, FYDAI2306B, FYUSDC2306B, FYUSDT2306B } from '../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSUSDT6MJD } from '../../../../shared/constants'

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

import { Series, Strategy, Strategy_V1 } from '../../confTypes'

const eth = base_config.bases.getOrThrow(ETH)!
const dai = base_config.bases.getOrThrow(DAI)!
const usdc = base_config.bases.getOrThrow(USDC)!
const frax = base_config.bases.getOrThrow(USDT)!
const ethIlks = base_config.ilks.getOrThrow(ETH)!
const daiIlks = base_config.ilks.getOrThrow(DAI)!
const usdcIlks = base_config.ilks.getOrThrow(USDC)!
const fraxIlks = base_config.ilks.getOrThrow(USDT)!

const fyETH2306B: Series = {
  seriesId: FYETH2306B,
  base: eth,
  fyToken: {
    assetId: FYETH2306B,
    address: fyTokens.getOrThrow(FYETH2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2306B,
    address: pools.getOrThrow(FYETH2306B)!,
  },
  ilks: [...ethIlks, base_config.ilkETHFETH2306],
}

const fyDAI2306B: Series = {
  seriesId: FYDAI2306B,
  base: dai,
  fyToken: {
    assetId: FYDAI2306B,
    address: fyTokens.getOrThrow(FYDAI2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2306B,
    address: pools.getOrThrow(FYDAI2306B)!,
  },
  ilks: [...daiIlks, base_config.ilkDAIFDAI2306],
}

const fyUSDC2306B: Series = {
  seriesId: FYUSDC2306B,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2306B,
    address: fyTokens.getOrThrow(FYUSDC2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2306B,
    address: pools.getOrThrow(FYUSDC2306B)!,
  },
  ilks: [...usdcIlks, base_config.ilkUSDCFUSDC2306],
}

const fyUSDT2306B: Series = {
  seriesId: FYUSDT2306B,
  base: frax,
  fyToken: {
    assetId: FYUSDT2306B,
    address: fyTokens.getOrThrow(FYUSDT2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2306B,
    address: pools.getOrThrow(FYUSDT2306B)!,
  },
  ilks: fraxIlks,
}

export const newSeries: Series[] = [fyETH2306B, fyDAI2306B, fyUSDC2306B, fyUSDT2306B]

const ysETH6MJD: Strategy = {
  assetId: YSETH6MJD,
  address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  base: eth,
  seriesToInvest: fyETH2306B,
  initAmount: ethers.utils.parseUnits('1000', 18),
}

const ysDAI6MJD: Strategy = {
  assetId: YSDAI6MJD,
  address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  base: dai,
  seriesToInvest: fyDAI2306B,
  initAmount: ethers.utils.parseUnits('1000000', 18),
}

const ysUSDC6MJD: Strategy = {
  assetId: YSUSDC6MJD,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  base: usdc,
  seriesToInvest: fyUSDC2306B,
  initAmount: ethers.utils.parseUnits('1000000', 6),
}

const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  base: frax,
  seriesToInvest: fyUSDT2306B,
  initAmount: ethers.utils.parseUnits('1000000', 6),
}

export const newStrategies: Strategy[] = [ysETH6MJD, ysDAI6MJD, ysUSDC6MJD, ysUSDT6MJD]
