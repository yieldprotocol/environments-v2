/**
 * @dev Input file for updateDust.ts
 */

import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, FRAX, UNI } from '../../../../shared/constants'
import * as base_config from '../../base.mainnet.config'
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets

export const developer: Map<number, string> = new Map([
  [1, '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'],
  [31337, '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

/// @notice Minimum debt limits
/// @param base identifier (bytes6 tag)
/// @param collateral identifier (bytes6 tag)
/// @param minimum vault debt, modified by decimals
export const newDebtMin: Array<[string, string, number]> = [
  [DAI, ETH, 1000], // Value in DAI
  [DAI, USDC, 1000], // Value in DAI
  [DAI, WBTC, 1000], // Value in DAI
  [DAI, LINK, 1000], // Value in DAI
  [DAI, FRAX, 1000], // Value in DAI
  [DAI, UNI, 1000], // Value in DAI
  [DAI, WSTETH, 1000], // Value in DAI
  [DAI, ENS, 1000], // Value in DAI
  [USDC, ETH, 1000], // Value in USDC
  [USDC, DAI, 1000], // Value in USDC
  [USDC, WBTC, 1000], // Value in USDC
  [USDC, LINK, 1000], // Value in USDC
  [USDC, FRAX, 1000], // Value in USDC
  [USDC, UNI, 1000], // Value in USDC
  [USDC, WSTETH, 1000], // Value in USDC
  [USDC, ENS, 1000], // Value in USDC
  [ETH, USDC, 1], // Value in ETH
  [ETH, DAI, 1], // Value in ETH
  [ETH, WBTC, 1], // Value in ETH
  [ETH, LINK, 1], // Value in ETH
  [ETH, FRAX, 1], // Value in ETH
  [ETH, UNI, 1], // Value in ETH
  [ETH, WSTETH, 1], // Value in ETH
  [ETH, ENS, 1], // Value in ETH
]

/// @notice Minimum debt limits to be used in an auction
/// @param collateral identifier (bytes6 tag)
/// @param Minimum debt, modified by decimals
export const newAuctionMin: Array<[string, number]> = [
  [ETH, 1000000], // Value in terawei (ETH*10**-6)
  [DAI, 1000], // Value in DAI
  [USDC, 1000], // Value in USDC
  [WBTC, 500], // Value in WBTC
  [WSTETH, 1000000], // Value in terawei (ETH*10**6)
  [LINK, 138], // Value in LINK
  [ENS, 64], // Value in ENS
  [UNI, 153], // Value in UNI
  [FRAX, 1000], // Value in FRAX
]

// /// @notice Limits to be used in an auction
// /// @param base identifier (bytes6 tag)
// /// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
// /// @param Maximum concurrently auctionable for this asset, modified by decimals
// /// @param Minimum vault debt, modified by decimals
// /// @param Decimals to append to auction ceiling and minimum vault debt.
// export const newLimits: Array<[string, string, number, number, number]> = [
//   [ETH, '720000000000000000', 32500000000, 1500000, 12], // DAI/ETH is 72% LTV
//   [DAI, '760000000000000000', 100000000, 5000, 18], // USDC/DAI is 76% LTV
//   [USDC, '760000000000000000', 100000000, 5000, 6], // DAI/USDC is 76% LTV
//   [WBTC, '670000000000000000', 25000000, 1200, 4], // ETH/WBTC is 67% LTV
//   [WSTETH, '800000000000000000', 32500000000, 1500000, 12], // ETH/WSTETH is 80% LTV
//   [LINK, '670000000000000000', 6000000, 300, 18], // ETH/LINK is 67% LTV
//   [ENS, '670000000000000000', 5000000, 250, 18], // ETH/ENS is 67% LTV
//   [YVUSDC, '800000000000000000', 10000000, 5000, 6], // USDC/YVUSDC is 80% LTV
//   [UNI, '670000000000000000', 10000000, 400, 18], // ETH/UNI is 67% LTV
//   [FRAX, '910000000000000000', 100000000, 400, 18], // DAI/FRAX is 91% LTV
// ]
