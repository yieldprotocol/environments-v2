import { ETH, DAI, USDC } from '../../../../shared/constants'

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const newLimits: Array<[string, string, number, number, number]> = [
  [ETH, '720000000000000000', 32500000000, 30000, 12], // DAI/ETH is 72% LTV
  [DAI, '760000000000000000', 100000000, 100, 18], // USDC/DAI is 76% LTV
  [USDC, '760000000000000000', 100000000, 100, 6], // DAI/USDC is 76% LTV
]
