import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC, FRAX } from '../../../../shared/constants'

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param ilk identifier (bytes6 tag)
/// @param Maximum global debt allowed for this pair, modified by decimals
/// @param Minimum vault debt allowed for this pair, modified by decimals
/// @param Decimals to append to global and vault debt.
export const newLimits: Array<[string, string, number, number, number]> = [
  [ETH, ETH, 2500, 0, 18],
  [ETH, DAI, 250, 3, 18],
  [ETH, USDC, 250, 3, 18],
  [ETH, WBTC, 250, 3, 18],
  [ETH, WSTETH, 250, 3, 18],
  [ETH, LINK, 250, 3, 18],
  [ETH, ENS, 250, 3, 18],
  [ETH, YVUSDC, 0, 0, 18],
  [ETH, UNI, 250, 3, 18],
  [ETH, FRAX, 250, 3, 18],
]
