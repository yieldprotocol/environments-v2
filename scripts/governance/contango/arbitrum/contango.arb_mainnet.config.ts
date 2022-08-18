import * as base_config from '../../base.arb_mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'

import { USDC, DAI, FYDAI2209, FYUSDC2209, CHAINLINKUSD, IDENTITY } from '../../../../shared/constants' // Note we use the series id as the asset id

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, joins.get(DAI) as string],
  [USDC, joins.get(USDC) as string],
]

// Input data: baseId, quoteId, oracle name
export const compositeSources: Array<[string, string, string]> = [
  [FYDAI2209, DAI, IDENTITY],
  [FYUSDC2209, USDC, IDENTITY],
  [DAI, USDC, CHAINLINKUSD],
]
// Input data: assetId, assetId, [intermediate assetId]
export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, FYUSDC2209, [USDC]],
  [USDC, FYDAI2209, [DAI]],
]

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
/// @param Address for the join
export const assetsToAdd: Array<[string, string, string]> = [
  [DAI, assets.get(DAI) as string, joins.get(DAI) as string],
  [USDC, assets.get(USDC) as string, joins.get(USDC) as string],
  [FYDAI2209, fyTokens.get(FYDAI2209) as string, newJoins.get(FYDAI2209) as string],
  [FYUSDC2209, fyTokens.get(FYUSDC2209) as string, newJoins.get(FYUSDC2209) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
/// @notice Collateralization parameters and debt limits for each new asset pair
/// @param Base asset identifier (bytes6 tag)
/// @param Collateral asset identifier (bytes6 tag)
/// @param Collateralization ratio, with six decimals
/// @param Maximum protocol debt, decimals to be added
/// @param Minimum vault debt, decimals to be added
/// @param Decimals to add to maximum protocol debt, and minimum vault debt.
export const fyTokenDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, FYUSDC2209, 1100000, 10000, 100, 18], // dai collateralized with fyUsdc
  [USDC, FYDAI2209, 1100000, 10000, 100, 6], // usdc collateralized with fyDai
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
// FYToken cannot get liquidated
export const auctionLimits: Array<[string, number, number, number, number, number]> = []

// Input data: seriesId, [ilkIds]
/// @notice New asset pairs to be accepted
/// @param Base asset identifier (bytes6 tag)
/// @param Array of collateral asset identifiers (bytes6 tag array)
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [FYUSDC2209]],
  [FYUSDC2209, [FYDAI2209]],
]
