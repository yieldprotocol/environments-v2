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
  [DAI, ETH, 1000],
  [DAI, USDC, 1000],
  [DAI, WBTC, 1000],
  [DAI, LINK, 1000],
  [DAI, FRAX, 1000],
  [DAI, UNI, 1000],
  [DAI, WSTETH, 1000],
  [DAI, ENS, 1000],
  [USDC, ETH, 1000],
  [USDC, DAI, 1000],
  [USDC, WBTC, 1000],
  [USDC, LINK, 1000],
  [USDC, FRAX, 1000],
  [USDC, UNI, 1000],
  [USDC, WSTETH, 1000],
  [USDC, ENS, 1000],
  [ETH, USDC, 1],
  [ETH, DAI, 1],
  [ETH, WBTC, 1],
  [ETH, LINK, 1],
  [ETH, FRAX, 1],
  [ETH, UNI, 1],
  [ETH, WSTETH, 1],
  [ETH, ENS, 1],
]

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param mindDebt Minimum vault debt, modified by decimals
export const newAuctionMin: Array<[string, number]> = [
  [ETH, 1000000],
  [DAI, 1000],
  [USDC, 1000],
  [WBTC, 500],
  [WSTETH, 1000000],
  [LINK, 138],
  [ENS, 64],
  [UNI, 153],
  [FRAX, 1000],
]
