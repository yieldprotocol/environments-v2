import { parseUnits } from 'ethers/lib/utils'

import * as base_config from '../../base.arb_mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

import { ETH, DAI, USDC, FYDAI2212, FYDAI2303 } from '../../../../shared/constants'
import { AuctionLineAndLimit } from '../../confTypes' // Note we use the series id as the asset id

// ----- proposal parameters -----

/// The Witch v2 will accept payment in these fyToken
export const seriesIds: Array<string> = [FYDAI2212, FYDAI2303]

/// Auction configuration for each asset pair
/// @param baseId assets in scope as underlying for vaults to be auctioned
/// @param ilkId assets in scope as collateral for vaults to be auctioned
/// @param duration time that it takes for the auction to offer maximum collateral
/// @param vaultProportion proportion of a vault that will be auctioned at a time
/// @param collateralProportion proportion of the collateral that will be paid out
/// at the begining of an auction
/// @param max If the aggregated collateral under auction for vaults of this pair
/// exceeds this number, no more auctions of for this pair can be started.
export const v2Limits: AuctionLineAndLimit[] = [
  // ETH
  {
    baseId: DAI,
    ilkId: ETH,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: USDC,
    ilkId: ETH,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  // USDC
  {
    baseId: ETH,
    ilkId: USDC,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000', 6),
  },
  {
    baseId: DAI,
    ilkId: USDC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000', 6),
  },
]

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param initial percentage of the collateral to be offered (fixed point with 18 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const v1Limits: Array<[string, string, number, number, number]> = [
  [ETH, '720000000000000000', 0, 30000, 12], // DAI/ETH is 72% LTV
  [DAI, '760000000000000000', 0, 100, 18], // USDC/DAI is 76% LTV
  [USDC, '760000000000000000', 0, 100, 6], // DAI/USDC is 76% LTV
]
