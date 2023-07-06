import * as base_config from '../../base.arb_mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const pools: Map<string, string> = base_config.pools
export const chainId = base_config.chainId

import { Series, Strategy } from '../../confTypes'

export const newSeries: Series[] = [base_config.fyETH2312, base_config.fyDAI2312, base_config.fyUSDC2312, base_config.fyUSDT2312]

export const rollStrategies: Strategy[] = [base_config.ysETH6MJD, base_config.ysDAI6MJD, base_config.ysUSDC6MJD, base_config.ysUSDT6MJD]
