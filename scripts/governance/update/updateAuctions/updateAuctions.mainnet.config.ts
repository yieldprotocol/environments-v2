import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC, FRAX } from '../../../../shared/constants'

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const newLimits: Array<[string, string, number, number, number]> = [
  [ETH, '720000000000000000', 32500000000, 1500000, 12], // DAI/ETH is 72% LTV
  [DAI, '760000000000000000', 100000000, 5000, 18], // USDC/DAI is 76% LTV
  [USDC, '760000000000000000', 100000000, 5000, 6], // DAI/USDC is 76% LTV
  [WBTC, '670000000000000000', 25000000, 1200, 4], // ETH/WBTC is 67% LTV
  [WSTETH, '800000000000000000', 32500000000, 1500000, 12], // ETH/WSTETH is 80% LTV
  [LINK, '670000000000000000', 6000000, 300, 18], // ETH/LINK is 67% LTV
  [ENS, '670000000000000000', 5000000, 250, 18], // ETH/ENS is 67% LTV
  [YVUSDC, '800000000000000000', 10000000, 5000, 6], // USDC/YVUSDC is 80% LTV
  [UNI, '670000000000000000', 10000000, 400, 18], // ETH/UNI is 67% LTV
  [FRAX, '910000000000000000', 100000000, 400, 18], // DAI/FRAX is 91% LTV
]
