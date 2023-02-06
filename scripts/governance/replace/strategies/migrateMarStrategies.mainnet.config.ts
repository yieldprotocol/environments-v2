import { ethers } from 'hardhat'
import { ETH, DAI, USDC, FRAX } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { FYETH2309, FYDAI2309, FYUSDC2309, FYFRAX2309 } from '../../../../shared/constants'
import {
  YSETH6MMS,
  YSDAI6MMS,
  YSUSDC6MMS,
  YSFRAX6MMS,
  YSETH6MMS_V1,
  YSDAI6MMS_V1,
  YSUSDC6MMS_V1,
  YSFRAX6MMS_V1,
} from '../../../../shared/constants'

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
const frax = base_config.bases.getOrThrow(FRAX)!
const ethIlks = base_config.ilks.getOrThrow(ETH)!
const daiIlks = base_config.ilks.getOrThrow(DAI)!
const usdcIlks = base_config.ilks.getOrThrow(USDC)!
const fraxIlks = base_config.ilks.getOrThrow(FRAX)!

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

export const newSeries: Series[] = [fyETH2309, fyDAI2309, fyUSDC2309, fyFRAX2309]

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

const ysFRAX6MMS: Strategy = {
  assetId: YSFRAX6MMS,
  address: strategyAddresses.getOrThrow(YSFRAX6MMS)!,
  base: frax,
  seriesToInvest: fyFRAX2309,
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

const ysFRAX6MMSV1: Strategy_V1 = {
  assetId: YSFRAX6MMS_V1,
  address: strategyAddresses.getOrThrow(YSFRAX6MMS_V1)!,
  base: frax,
  seriesToInvest: ysFRAX6MMS,
}

export const oldStrategies: Strategy_V1[] = [ysETH6MMSV1, ysDAI6MMSV1, ysUSDC6MMSV1, ysFRAX6MMSV1]
export const newStrategies: Strategy[] = [ysETH6MMS, ysDAI6MMS, ysUSDC6MMS, ysFRAX6MMS]

export const rollStrategies = oldStrategies
export const joinLoans = [
  [DAI, ethers.utils.parseUnits('1000000', 18)],
  [USDC, ethers.utils.parseUnits('1000000', 6)],
  [FRAX, ethers.utils.parseUnits('1000000', 18)],
]
