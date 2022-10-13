import * as base_config from '../../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

import { FUSDC2212, FDAI2212, FUSDC2303, FDAI2303, FYUSDC2303, FYDAI2303 } from '../../../../../../shared/constants'

/// @dev FCash tenors to accept, using a previously accepted tenor to copy the configuration from.
/// @param oldAssetId: existing fCash in Yield Protocol to copy data from
/// @param newAssetId: assetId to use for the new
/// @param newSeriesId: seriesId to link the new fCash tenor to
export const notionalAssets: Array<[string, string, string]> = [
  [FDAI2212, FDAI2303, FYDAI2303],
  [FUSDC2212, FUSDC2303, FYUSDC2303],
]
