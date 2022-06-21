import * as base_config from '../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies
export const assets: Map<string, string> = base_config.assets

import { DAI, EDAI, FYDAI2209, FYDAI2212 } from '../../../../../shared/constants'

/// @notice Oracle sources to be added to ETokenMultiOracle
/// @param underlying asset id (bytes6 tag)
/// @param eToken id (bytes 6 tag)
/// @param Address of the eToken contract to use as the oracle
export const eulerSources: Array<[string, string, string]> = [[DAI, EDAI, assets.get(EDAI) as string]]

/// @notice Assets for which we will have a Join
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
export const assetsToAdd: Array<[string, string]> = [[EDAI, assets.get(EDAI) as string]]

/// @notice Configure an asset as an ilk for a base using the ETokenMultiOracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const debtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, EDAI, 1250000, 1000000, 5000, 18],
]

/// @notice Limits to be used in an auction
/// @param ilk id (bytes6 tag)
/// @param duration of auctions in seconds
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const auctionLimits: Array<[string, number, number, number, number, number]> = [
  [EDAI, 3600, 600000, 1000000, 2, 18],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tag)
export const seriesIlks: Array<[string, string[]]> = [[FYDAI2209, [EDAI]]]