import { ETH, GNO } from '../../../../../shared/constants'

import * as base_config from './addChainlinkCollateral.config'

export const chainId: number = base_config.chainId
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = base_config.assetsToAdd

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = base_config.chainlinkDebtLimits

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = base_config.seriesIlks

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [GNO, assets.get(GNO) as string, ETH, assets.get(ETH) as string, '0xA614953dF476577E90dcf4e3428960e221EA4727'],
]

