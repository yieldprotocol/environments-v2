import * as base_config from '../../base.arb_mainnet.config'

import { DAI, USDC } from '../../../../shared/constants'

export const governance = base_config.governance
export const protocol = base_config.protocol
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

/// @notice Collateralization ratios
/// @param base identifier (bytes6 tag)
/// @param collateral identifier (bytes6 tag)
/// @param collateralization ratio (6 decimals)
export const ratios: Array<[string, string, number]> = [
  [DAI, USDC, 1100000],
  [USDC, DAI, 1100000],
]

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const newLimits: Array<[string, string, number, number, number]> = [
  [DAI, '910000000000000000', 100000000, 100, 18], // USDC/DAI is 91% LTV
  [USDC, '910000000000000000', 100000000, 100, 6], // DAI/USDC is 91% LTV
]
