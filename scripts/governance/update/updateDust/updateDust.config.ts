/**
 * @dev Input file for updateDust.ts
 */

import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, FRAX, UNI } from '../../../../shared/constants'
import * as base_config from '../../base.mainnet.config'
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets

export const developer = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'

/// @notice The new debt minimums.
/// @param baseId The base asset id.
/// @param ilkId The ilk id.
/// @param minDebt The new minimum debt.
export const newDebtMin: Array<[string, string, number]> = [
  [FRAX, FRAX, 1000],
  [FRAX, ETH, 1000],
  [FRAX, DAI, 1000],
  [FRAX, USDC, 1000],
  [FRAX, WBTC, 1000],
  [FRAX, LINK, 1000],
  [FRAX, UNI, 1000],
]

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param mindDebt Minimum vault debt, modified by decimals
export const newAuctionMin: Array<[string, number]> = [
  // [ETH, 1000000], // Value in terawei (ETH*10**-6)
  // [DAI, 1000], // Value in DAI
  // [USDC, 1000], // Value in USDC
  // [WBTC, 500], // Value in WBTC
  // [WSTETH, 1000000], // Value in terawei (ETH*10**6)
  // [LINK, 138], // Value in LINK
  // [ENS, 64], // Value in ENS
  // [UNI, 153], // Value in UNI
  // [FRAX, 1000], // Value in FRAX
]
