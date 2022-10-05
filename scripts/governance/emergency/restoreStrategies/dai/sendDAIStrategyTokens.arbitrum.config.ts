import { YSDAI6MJD } from '../../../../../shared/constants'
import * as base_config from '../../../base.arb_mainnet.config'
const path = require('path')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const strategies: Map<string, string> = base_config.strategies

// user strategy balance data at snapshot
export const filePath = path.join(__dirname, 'ARBITRUM_YSDAI6MJD.csv')
export const strategyAddr = strategies.get(YSDAI6MJD) as string
export const affectedStrategyAddr = '0xe7214af14bd70f6aac9c16b0c1ec9ee1ccc7efda'

export const developer = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'
