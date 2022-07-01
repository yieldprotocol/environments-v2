import { DAI, ETH, FYDAI2209, FYETH2209, FYUSDC2209, GNO, USDC } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

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
export const assetsToAdd: Array<[string, string]> = [[GNO, assets.get(GNO) as string]]

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [GNO, assets.get(GNO) as string, ETH, assets.get(ETH) as string, '0xA614953dF476577E90dcf4e3428960e221EA4727'],
]

/// @notice Limits to be used in an auction
/// @param ilk id (bytes6 tag)
/// @param duration of auctions in seconds
/// @param initial percentage of the collateral to be offered (fixed point with 18 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const auctionLimits: Array<[string, number, string, number, number, number]> = [
  [GNO, 3600, '910000000000000000', 10_000_000, 5000, 18], // 91% = 1/110%
]

/// @notice Configure an asset as an ilk for a base using the ETokenMultiOracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const debtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, GNO, 1_100_000, 1_000_000, 5000, 18], // 110%
  [USDC, GNO, 1_100_000, 1_000_000, 5000, 6], // 110%
  [ETH, GNO, 1_100_000, 1_000_000, 5000, 15], // 110%. 5000 ETH with 15 decimals => 5 ETH. 1M ETH with 15 decimals => 1000 ETH
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tag)
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [GNO]],
  [FYUSDC2209, [GNO]],
  [FYETH2209, [GNO]],
]