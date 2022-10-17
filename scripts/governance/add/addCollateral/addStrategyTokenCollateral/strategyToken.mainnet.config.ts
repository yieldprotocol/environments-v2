import {
  CHAINLINK,
  DAI,
  ETH,
  FRAX,
  FYDAI2209,
  FYETH2209,
  FYFRAX2209,
  FYUSDC2209,
  USDC,
  YSDAI6MJDASSET,
  YSDAI6MMS,
  YSDAI6MMSASSET,
  YSETH6MJDASSET,
  YSETH6MMSASSET,
  YSFRAX6MJDASSET,
  YSFRAX6MMSASSET,
  YSUSDC6MJDASSET,
  YSUSDC6MMSASSET,
} from '../../../../../shared/constants'
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

export const assetsToAdd: Array<[string, string]> = [
  [YSDAI6MMSASSET, assets.get(YSDAI6MMSASSET) as string],
  [YSDAI6MJDASSET, assets.get(YSDAI6MJDASSET) as string],
  [YSUSDC6MMSASSET, assets.get(YSUSDC6MMSASSET) as string],
  [YSUSDC6MJDASSET, assets.get(YSUSDC6MJDASSET) as string],
  [YSETH6MMSASSET, assets.get(YSETH6MMSASSET) as string],
  [YSETH6MJDASSET, assets.get(YSETH6MJDASSET) as string],
  [YSFRAX6MMSASSET, assets.get(YSFRAX6MMSASSET) as string],
  [YSFRAX6MJDASSET, assets.get(YSFRAX6MJDASSET) as string],
]

export const strategyOracleSources: Array<[string, string, number, string]> = [
  [YSDAI6MMSASSET, DAI, 18, assets.get(YSDAI6MMSASSET) as string],
  [YSDAI6MJDASSET, DAI, 18, assets.get(YSDAI6MJDASSET) as string],
  [YSUSDC6MMSASSET, USDC, 6, assets.get(YSUSDC6MMSASSET) as string],
  [YSUSDC6MJDASSET, USDC, 6, assets.get(YSUSDC6MJDASSET) as string],
  [YSETH6MMSASSET, ETH, 18, assets.get(YSETH6MMSASSET) as string],
  [YSETH6MJDASSET, ETH, 18, assets.get(YSETH6MJDASSET) as string],
  [YSFRAX6MMSASSET, FRAX, 18, assets.get(YSFRAX6MMSASSET) as string],
  [YSFRAX6MJDASSET, FRAX, 18, assets.get(YSFRAX6MJDASSET) as string],
]

/// @notice Configure an asset as an ilk for a base using the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newStrategyLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, YSDAI6MMSASSET, 1100000, 1000000, 5000, 18],
  [DAI, YSDAI6MJDASSET, 1100000, 1000000, 5000, 18],
  [USDC, YSUSDC6MMSASSET, 1100000, 1000000, 5000, 6],
  [USDC, YSUSDC6MJDASSET, 1100000, 1000000, 5000, 6],
  [ETH, YSETH6MMSASSET, 1100000, 1000000, 5000, 18],
  [ETH, YSETH6MJDASSET, 1100000, 1000000, 5000, 18],
  [FRAX, YSFRAX6MMSASSET, 1100000, 1000000, 5000, 18],
  [FRAX, YSFRAX6MJDASSET, 1100000, 1000000, 5000, 18],
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
  [YSDAI6MMSASSET, 3600, 1000000, 1000000, 5000, 18],
  [YSDAI6MJDASSET, 3600, 1000000, 1000000, 5000, 18],
  [YSUSDC6MMSASSET, 3600, 1000000, 1000000, 5000, 6],
  [YSUSDC6MJDASSET, 3600, 1000000, 1000000, 5000, 6],
  [YSETH6MMSASSET, 3600, 1000000, 1000000, 5000, 18],
  [YSETH6MJDASSET, 3600, 1000000, 1000000, 5000, 18],
  [YSFRAX6MMSASSET, 3600, 1000000, 1000000, 5000, 18],
  [YSFRAX6MJDASSET, 3600, 1000000, 1000000, 5000, 18],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [YSDAI6MMSASSET]],
  [FYUSDC2209, [YSUSDC6MMSASSET]],
  [FYFRAX2209, [YSFRAX6MMSASSET]],
  [FYETH2209, [YSETH6MMSASSET]],
  // [FYFRAX2209, [YSDAI6MMSTOKEN]],
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: Array<[string, string, string]> = [[DAI, YSDAI6MMSASSET, 'strategyOracle']]

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const newCompositePaths: Array<[string, string, Array<string>]> = [[FRAX, YSDAI6MMSASSET, [ETH, DAI]]]

/// @notice Configure an asset as an ilk for a base using the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newCompositeLimits: Array<[string, string, number, number, number, number]> = [
  [FRAX, YSDAI6MMSASSET, 1100000, 1000000, 5000, 18],
]
