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

export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [GNO, assets.get(GNO) as string, ETH, assets.get(ETH) as string, ''],
]

