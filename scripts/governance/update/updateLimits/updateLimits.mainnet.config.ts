import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  LINK,
  ENS,
  UNI,
  YVUSDC,
  FRAX,
  FDAI2303,
  FDAI2306,
  FETH2303,
  FETH2306,
  FUSDC2303,
  FUSDC2306,
} from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param ilk identifier (bytes6 tag)
/// @param Maximum global debt allowed for this pair, modified by decimals
/// @param Minimum vault debt allowed for this pair, modified by decimals
/// @param Decimals to append to global and vault debt.
export const newLimits: Array<[string, string, number, number, number]> = [
  [DAI, FDAI2303, 1000000, 1000, 18],
  [DAI, FDAI2306, 1000000, 1000, 18],
  [USDC, FUSDC2303, 1000000, 1000, 6],
  [USDC, FUSDC2306, 1000000, 1000, 6],
]
