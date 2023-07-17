import { ONEUSDC } from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers

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

export const newSeries: Series[] = [base_config.fyETH2312, base_config.fyDAI2312, base_config.fyUSDC2312, base_config.fyUSDT2312]

export const rollStrategies: Strategy[] = [base_config.ysETH6MJD, base_config.ysDAI6MJD, base_config.ysUSDC6MJD, base_config.ysUSDT6MJD]
