import { ETH, DAI, USDC, USDT, WAD } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { ONEUSDC } from '../../../../shared/constants'
import { FYETH2306, FYETH2309, FYDAI2306, FYDAI2309, FYUSDC2306, FYUSDC2309, FYUSDT2306, FYUSDT2309 } from '../../../../shared/constants'

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

import { Series, Strategy, Transfer } from '../../confTypes'

export const eth = base_config.bases.get(ETH)!
export const ethIlks = base_config.ilks.get(ETH)!
export const dai = base_config.bases.get(DAI)!
export const daiIlks = base_config.ilks.get(DAI)!
export const usdc = base_config.bases.get(USDC)!
export const usdcIlks = base_config.ilks.get(USDC)!
export const usdt = base_config.bases.get(USDT)!
export const usdtIlks = base_config.ilks.get(USDT)!

export const fyETH2306: Series = {
  seriesId: FYETH2306,
  base: eth,
  fyToken: {
    assetId: FYETH2306,
    address: fyTokens.getOrThrow(FYETH2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2306,
    address: pools.getOrThrow(FYETH2306)!,
  },
  ilks: ethIlks,
}

export const fyETH2309: Series = {
  seriesId: FYETH2309,
  base: eth,
  fyToken: {
    assetId: FYETH2309,
    address: fyTokens.getOrThrow(FYETH2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2309,
    address: pools.getOrThrow(FYETH2309)!,
  },
  ilks: ethIlks,
}

export const fyDAI2306: Series = {
  seriesId: FYDAI2306,
  base: dai,
  fyToken: {
    assetId: FYDAI2306,
    address: fyTokens.getOrThrow(FYDAI2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2306,
    address: pools.getOrThrow(FYDAI2306)!,
  },
  ilks: daiIlks,
}

export const fyDAI2309: Series = {
  seriesId: FYDAI2309,
  base: dai,
  fyToken: {
    assetId: FYDAI2309,
    address: fyTokens.getOrThrow(FYDAI2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2309,
    address: pools.getOrThrow(FYDAI2309)!,
  },
  ilks: daiIlks,
}

export const fyUSDC2306: Series = {
  seriesId: FYUSDC2306,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2306,
    address: fyTokens.getOrThrow(FYUSDC2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2306,
    address: pools.getOrThrow(FYUSDC2306)!,
  },
  ilks: usdcIlks,
}

export const fyUSDC2309: Series = {
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

export const fyUSDT2306: Series = {
  seriesId: FYUSDT2306,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2306,
    address: fyTokens.getOrThrow(FYUSDT2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2306,
    address: pools.getOrThrow(FYUSDT2306)!,
  },
  ilks: usdtIlks,
}

export const fyUSDT2309: Series = {
  seriesId: FYUSDT2309,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2309,
    address: fyTokens.getOrThrow(FYUSDT2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2309,
    address: pools.getOrThrow(FYUSDT2309)!,
  },
  ilks: usdtIlks,
}

export const restoredSeries: Series[] = [/* fyETH2306,*/ fyETH2309, fyDAI2306, fyDAI2309, /* fyUSDC2306,*/ fyUSDC2309, fyUSDT2306, fyUSDT2309]

export const baseTransfers: Array<Transfer> = [
//  {
//    token: eth,
//    receiver: fyETH2306.pool.address,
//    amount: WAD.div(20),
//  },
  {
    token: eth,
    receiver: fyETH2309.pool.address,
    amount: WAD.div(20),
  },
  {
    token: dai,
    receiver: fyDAI2306.pool.address,
    amount: WAD.mul(50),
  },
  {
    token: dai,
    receiver: fyDAI2309.pool.address,
    amount: WAD.mul(50),
  },
//  {
//    token: usdc,
//    receiver: fyUSDC2306.pool.address,
//    amount: ONEUSDC.mul(50),
//  },
  {
    token: usdc,
    receiver: fyUSDC2309.pool.address,
    amount: ONEUSDC.mul(50),
  },
  {
    token: usdt,
    receiver: fyUSDT2306.pool.address,
    amount: ONEUSDC.mul(50),
  },
  {
    token: usdt,
    receiver: fyUSDT2309.pool.address,
    amount: ONEUSDC.mul(50),
  },
]

export const transfers: Array<Transfer> = baseTransfers