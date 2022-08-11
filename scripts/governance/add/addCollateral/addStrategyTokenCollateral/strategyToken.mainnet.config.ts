import { DAI, FYDAI2209, YSDAI6MMS, YSDAI6MMSTOKEN } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies
export const strategies: Map<string, string> = base_config.strategies
export const newJoins: Map<string, string> = readAddressMappingIfExists('newJoins.json')

export const assetsToAdd: Array<[string, string]> = [[YSDAI6MMSTOKEN, assets.get(YSDAI6MMSTOKEN) as string]]

export const strategyOracleSources: Array<[string, string, number, string]> = [
  [YSDAI6MMSTOKEN, DAI, 18, assets.get(YSDAI6MMSTOKEN) as string],
]

/// @notice Configure an asset as an ilk for a base using the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newStrategyLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, YSDAI6MMSTOKEN, 1100000, 1000000, 5000, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param duration of auctions in seconds
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const strategyAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [YSDAI6MMSTOKEN, 3600, 1000000, 1000000, 5000, 18],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [[FYDAI2209, [YSDAI6MMSTOKEN]]]
