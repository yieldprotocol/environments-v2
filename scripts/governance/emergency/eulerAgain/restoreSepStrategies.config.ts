import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { ETH, DAI, USDC, USDT, FRAX } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { FYETH2309, FYDAI2309, FYUSDC2309, FYUSDT2309 } from '../../../../shared/constants'
import { YSETH6MMS, YSDAI6MMS, YSUSDC6MMS, YSUSDT6MMS } from '../../../../shared/constants'

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

import { Series, Strategy, Transfer, PoolRestoration } from '../../confTypes'

const eth = base_config.bases.getOrThrow(ETH)!
const dai = base_config.bases.getOrThrow(DAI)!
const usdc = base_config.bases.getOrThrow(USDC)!
const usdt = base_config.bases.getOrThrow(USDT)!
const ethIlks = base_config.ilks.getOrThrow(ETH)!
const daiIlks = base_config.ilks.getOrThrow(DAI)!
const usdcIlks = base_config.ilks.getOrThrow(USDC)!
const usdtIlks = base_config.ilks.getOrThrow(USDT)!

const fyETH2309: Series = {
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

const fyDAI2309: Series = {
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

const fyUSDT2309: Series = {
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

export const newSeries: Series[] = [fyETH2309, fyDAI2309, fyUSDC2309, fyUSDT2309]

const ysETH6MMS: Strategy = {
  assetId: YSETH6MMS,
  address: strategyAddresses.getOrThrow(YSETH6MMS)!,
  base: eth,
  seriesToInvest: fyETH2309,
  initAmount: ethers.utils.parseUnits('0.1', 18),
}

const ysDAI6MMS: Strategy = {
  assetId: YSDAI6MMS,
  address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  base: dai,
  seriesToInvest: fyDAI2309,
  initAmount: ethers.utils.parseUnits('100', 18),
}

const ysUSDC6MMS: Strategy = {
  assetId: YSUSDC6MMS,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  base: usdc,
  seriesToInvest: fyUSDC2309,
  initAmount: ethers.utils.parseUnits('100', 6),
}

const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
  seriesToInvest: fyUSDT2309,
  initAmount: ethers.utils.parseUnits('100', 6),
}

export const newStrategies: Strategy[] = [ysETH6MMS, ysDAI6MMS, ysUSDC6MMS, ysUSDT6MMS]

// We transfer to the pools the base they contained before, plus the euler bonus according to pool base to fyToken ratio
export const transfers: Array<Transfer> = [
  {
    token: eth,
    receiver: pools.getOrThrow(FYETH2309)!,
    amount: BigNumber.from('79099208301878100000'),
  },
  {
    token: dai,
    receiver: pools.getOrThrow(FYDAI2309)!,
    amount: BigNumber.from('360547178067904000000000'),
  },
  {
    token: usdc,
    receiver: pools.getOrThrow(FYUSDC2309)!,
    amount: BigNumber.from('446324161144'),
  }
]

interface Mint {
  seriesId: string,
  receiver: string,
}

// From the base transfer, we mint the first batch of pool tokens to the strategies
export const mints: Array<Mint> = [
  {
    seriesId: FYETH2309,
    receiver: strategyAddresses.getOrThrow(YSETH6MMS)!,
  },
  {
    seriesId: FYDAI2309,
    receiver: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  },
  {
    seriesId: FYUSDC2309,
    receiver: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  }
]

// For the second batch of pool tokens, we are flash borrowing underlying equal to the fyToken balances in the March pools. We mint pool tokens with that, and then buy the underlying back by minting fyToken.
export const poolRestorations: Array<PoolRestoration> = [
  {
    seriesId: FYETH2309,
    receiver: strategyAddresses.getOrThrow(YSETH6MMS)!,
    amount: BigNumber.from('49006807052994200000'),
  },
  {
    seriesId: FYDAI2309,
    receiver: strategyAddresses.getOrThrow(YSDAI6MMS)!,
    amount: BigNumber.from('155742829126709000000000'),
  },
  {
    seriesId: FYUSDC2309,
    receiver: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
    amount: BigNumber.from('480444924178'),
  }
]