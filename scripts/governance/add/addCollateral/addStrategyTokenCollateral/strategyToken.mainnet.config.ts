import {
  CHAINLINK,
  DAI,
  ETH,
  FRAX,
  FYDAI2209,
  FYDAI2212,
  FYDAI2303,
  FYETH2209,
  FYETH2212,
  FYETH2303,
  FYFRAX2209,
  FYFRAX2212,
  FYUSDC2209,
  FYUSDC2212,
  FYUSDC2303,
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
export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
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
]

export const strategyOracleSources: Array<[string, string]> = [
  [YSDAI6MMSASSET, assets.get(YSDAI6MMSASSET) as string],
  [YSDAI6MJDASSET, assets.get(YSDAI6MJDASSET) as string],
  [YSUSDC6MMSASSET, assets.get(YSUSDC6MMSASSET) as string],
  [YSUSDC6MJDASSET, assets.get(YSUSDC6MJDASSET) as string],
  [YSETH6MMSASSET, assets.get(YSETH6MMSASSET) as string],
  [YSETH6MJDASSET, assets.get(YSETH6MJDASSET) as string],
]

/// @notice Configure an asset as an ilk for a base using the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newStrategyLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, YSDAI6MMSASSET, 1100000, 10000, 1000, 18],
  [DAI, YSDAI6MJDASSET, 1100000, 10000, 1000, 18],
  [USDC, YSUSDC6MMSASSET, 1100000, 10000, 1000, 6],
  [USDC, YSUSDC6MJDASSET, 1100000, 10000, 1000, 6],
  [ETH, YSETH6MMSASSET, 1100000, 8, 1, 18],
  [ETH, YSETH6MJDASSET, 1100000, 8, 1, 18],
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
  [YSDAI6MMSASSET, 3600, 1000000, 10000, 1000, 18],
  [YSDAI6MJDASSET, 3600, 1000000, 10000, 1000, 18],
  [YSUSDC6MMSASSET, 3600, 1000000, 10000, 1000, 6],
  [YSUSDC6MJDASSET, 3600, 1000000, 10000, 1000, 6],
  [YSETH6MMSASSET, 3600, 1000000, 8, 1, 18],
  [YSETH6MJDASSET, 3600, 1000000, 8, 1, 18],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2212, [YSDAI6MJDASSET]],
  [FYDAI2303, [YSDAI6MMSASSET]],
  [FYUSDC2212, [YSUSDC6MJDASSET]],
  [FYUSDC2303, [YSUSDC6MMSASSET]],
  [FYETH2212, [YSETH6MJDASSET]],
  [FYETH2303, [YSETH6MMSASSET]],
]
