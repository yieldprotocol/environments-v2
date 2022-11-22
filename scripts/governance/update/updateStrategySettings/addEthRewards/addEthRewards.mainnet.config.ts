import { ETH, YSETH6MJD, YSETH6MMS } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol()
export const assets: Map<string, string> = base_config.assets
export const strategies: Map<string, string> = base_config.strategies

export const strategiesData: Array<[string, string, string, string, number, number, number]> = [
  // name, symbol, baseId, rewardsTokenAddress, rewards start, rewards stop, rewards rate
  [
    'Yield Strategy ETH 6M Jun Dec',
    YSETH6MJD,
    ETH,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    1669852800,
    1672531199,
    3733573675916,
  ],
]
