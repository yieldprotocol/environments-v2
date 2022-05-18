import * as base_config from '../../base.arb_mainnet.config'

import { DAI, USDC } from '../../../../shared/constants'

export const governance = base_config.governance
export const protocol = base_config.protocol
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Input data: baseId, ilkId, ratio (1000000 == 100%)
export const ratios: Array<[string, string, number]> = [
  [DAI, USDC, 1100000],
  [USDC, DAI, 1100000],
]
