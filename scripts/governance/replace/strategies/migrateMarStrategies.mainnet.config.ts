import { ethers } from 'hardhat'
import { DAI, USDC, FRAX } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { FYFRAX2309 } from '../../../../shared/constants'
import { YSFRAX6MMS, YSFRAX6MMS_V1 } from '../../../../shared/constants'

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

const frax = base_config.bases.getOrThrow(FRAX)!
const fraxIlks = base_config.ilks.getOrThrow(FRAX)!

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

const ysFRAX6MMSV1: Strategy_V1 = {
  assetId: YSFRAX6MMS_V1,
  address: strategyAddresses.getOrThrow(YSFRAX6MMS_V1)!,
  base: frax,
  seriesToInvest: ysFRAX6MMS,
}

export const oldStrategies: Strategy_V1[] = [ysFRAX6MMSV1]
export const newStrategies: Strategy[] = [ysFRAX6MMS]

export const rollStrategies = oldStrategies
export const joinLoans = [
  [DAI, ethers.utils.parseUnits('1000000', 18)],
  [USDC, ethers.utils.parseUnits('1000000', 6)],
  [FRAX, ethers.utils.parseUnits('1000000', 18)],
]
