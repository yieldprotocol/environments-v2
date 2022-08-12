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
  YSDAI6MJDTOKEN,
  YSDAI6MMS,
  YSDAI6MMSTOKEN,
  YSETH6MJDTOKEN,
  YSETH6MMSTOKEN,
  YSFRAX6MJDTOKEN,
  YSFRAX6MMSTOKEN,
  YSUSDC6MJDTOKEN,
  YSUSDC6MMSTOKEN,
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
  [YSDAI6MMSTOKEN, assets.get(YSDAI6MMSTOKEN) as string],
  [YSDAI6MJDTOKEN, assets.get(YSDAI6MJDTOKEN) as string],
  [YSUSDC6MMSTOKEN, assets.get(YSUSDC6MMSTOKEN) as string],
  [YSUSDC6MJDTOKEN, assets.get(YSUSDC6MJDTOKEN) as string],
  [YSETH6MMSTOKEN, assets.get(YSETH6MMSTOKEN) as string],
  [YSETH6MJDTOKEN, assets.get(YSETH6MJDTOKEN) as string],
  [YSFRAX6MMSTOKEN, assets.get(YSFRAX6MMSTOKEN) as string],
  [YSFRAX6MJDTOKEN, assets.get(YSFRAX6MJDTOKEN) as string],
]

export const strategyOracleSources: Array<[string, string, number, string]> = [
  [YSDAI6MMSTOKEN, DAI, 18, assets.get(YSDAI6MMSTOKEN) as string],
  [YSDAI6MJDTOKEN, DAI, 18, assets.get(YSDAI6MJDTOKEN) as string],
  [YSUSDC6MMSTOKEN, USDC, 6, assets.get(YSUSDC6MMSTOKEN) as string],
  [YSUSDC6MJDTOKEN, USDC, 6, assets.get(YSUSDC6MJDTOKEN) as string],
  [YSETH6MMSTOKEN, ETH, 18, assets.get(YSETH6MMSTOKEN) as string],
  [YSETH6MJDTOKEN, ETH, 18, assets.get(YSETH6MJDTOKEN) as string],
  [YSFRAX6MMSTOKEN, FRAX, 18, assets.get(YSFRAX6MMSTOKEN) as string],
  [YSFRAX6MJDTOKEN, FRAX, 18, assets.get(YSFRAX6MJDTOKEN) as string],
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
  [DAI, YSDAI6MJDTOKEN, 1100000, 1000000, 5000, 18],
  [USDC, YSUSDC6MMSTOKEN, 1100000, 1000000, 5000, 6],
  [USDC, YSUSDC6MJDTOKEN, 1100000, 1000000, 5000, 6],
  [ETH, YSETH6MMSTOKEN, 1100000, 1000000, 5000, 18],
  [ETH, YSETH6MJDTOKEN, 1100000, 1000000, 5000, 18],
  [FRAX, YSFRAX6MMSTOKEN, 1100000, 1000000, 5000, 18],
  [FRAX, YSFRAX6MJDTOKEN, 1100000, 1000000, 5000, 18],
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
  [YSDAI6MJDTOKEN, 3600, 1000000, 1000000, 5000, 18],
  [YSUSDC6MMSTOKEN, 3600, 1000000, 1000000, 5000, 6],
  [YSUSDC6MJDTOKEN, 3600, 1000000, 1000000, 5000, 6],
  [YSETH6MMSTOKEN, 3600, 1000000, 1000000, 5000, 18],
  [YSETH6MJDTOKEN, 3600, 1000000, 1000000, 5000, 18],
  [YSFRAX6MMSTOKEN, 3600, 1000000, 1000000, 5000, 18],
  [YSFRAX6MJDTOKEN, 3600, 1000000, 1000000, 5000, 18],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [YSDAI6MMSTOKEN]],
  [FYUSDC2209, [YSUSDC6MMSTOKEN]],
  [FYFRAX2209, [YSFRAX6MMSTOKEN]],
  [FYETH2209, [YSETH6MMSTOKEN]],
  // [FYFRAX2209, [YSDAI6MMSTOKEN]],
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: Array<[string, string, string]> = [
  [DAI, YSDAI6MMSTOKEN, protocol.get('strategyOracle') as string],
]

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const newCompositePaths: Array<[string, string, Array<string>]> = [[FRAX, YSDAI6MMSTOKEN, [ETH, DAI]]]

/// @notice Configure an asset as an ilk for a base using the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newCompositeLimits: Array<[string, string, number, number, number, number]> = [
  [FRAX, YSDAI6MMSTOKEN, 1100000, 1000000, 5000, 18],
]
