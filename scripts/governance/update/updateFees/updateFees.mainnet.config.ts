import { FYETH2212, FYDAI2212, FYUSDC2212 } from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const governance: Map<string, string> = base_config.governance
export const pools: Map<string, string> = base_config.pools

export const poolFees: Array<[string, number]> = [
  [FYETH2212, 0],
  [FYDAI2212, 0],
  [FYUSDC2212, 0],
]
