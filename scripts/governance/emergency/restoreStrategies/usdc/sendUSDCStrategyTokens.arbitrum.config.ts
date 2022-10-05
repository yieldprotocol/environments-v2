import { YSUSDC6MJD } from '../../../../../shared/constants'
import * as base_config from '../../../base.arb_mainnet.config'
const path = require('path')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const strategies: Map<string, string> = base_config.strategies

// user strategy balance data at snapshot
export const filePath = path.join(__dirname, 'ARBITRUM_YSUSDC6MJD.csv')
export const strategyAddr = strategies.get(YSUSDC6MJD) as string
export const affectedStrategyAddr = '0xdc705fb403dbb93da1d28388bc1dc84274593c11'

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
