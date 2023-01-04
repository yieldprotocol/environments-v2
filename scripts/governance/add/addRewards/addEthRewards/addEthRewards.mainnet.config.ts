import { ETH, YSETH6MJD } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol()
export const assets: Map<string, string> = base_config.assets
export const strategies: Map<string, string> = base_config.strategies

export const rewardsData: Array<[string, string, number, number, number]> = [
  // strategyId, rewardsTokenAddress, rewards start, rewards stop, rewards rate
  [YSETH6MJD, assets.getOrThrow(ETH)!, 1669852800, 1672531199, 3733573675916],
]
