import { ETH, YSETH6MJD, YSETH6MMS } from '../../shared/constants'

import * as base_config from '../../scripts/governance/base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const strategies: Map<string, string> = base_config.strategies

// export const strategiesData: Array<[string, string, string]> = [
//   // name, symbol, baseId
//   ['Yield Strategy ETH 6M Mar Sep', YSETH6MMS, ETH],
//   ['Yield Strategy ETH 6M Jun Dec', YSETH6MJD, ETH],
// ]
