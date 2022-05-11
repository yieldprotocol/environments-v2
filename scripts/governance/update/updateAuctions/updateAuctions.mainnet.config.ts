import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC, FRAX } from '../../../../shared/constants'

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const newLimits: Array<[string, string, number, number, number]> = [
  [ETH,    '666000000000000000', 32500000000, 1500000, 12],
  [DAI,    '714000000000000000', 100000000,   5000,    18],
  [USDC,   '714000000000000000', 100000000,   5000,    6],
  [WBTC,   '666000000000000000', 25000000,    1200,    4],
  [WSTETH, '666000000000000000', 32500000000, 1500000, 12],
  [LINK,   '600000000000000000', 6000000,     300,     18],
  [ENS,    '600000000000000000', 5000000,     250,     18],
  [YVUSDC, '800000000000000000', 10000000,    5000,    6],
  [UNI,    '600000000000000000', 10000000,    400,     18],
  [FRAX,   '714000000000000000', 100000000,   400,     18],
]
