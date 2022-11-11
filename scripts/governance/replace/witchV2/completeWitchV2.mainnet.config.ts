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

import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  LINK,
  ENS,
  YVUSDC,
  UNI,
  FRAX,
  FYETH2212,
  FYDAI2212,
  FYUSDC2212,
  FYFRAX2212,
  FYETH2303,
  FYDAI2303,
  FYUSDC2303,
  FYFRAX2303,
  CAULDRON,
  LADLE,
  WITCH,
} from '../../../../shared/constants'
import { AuctionLineAndLimit, ContractDeployment } from '../../confTypes' // Note we use the series id as the asset id

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
  {
    baseId: FRAX,
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
  {
    baseId: FRAX,
    ilkId: USDC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000', 6),
  },
  // YVUSDC
  {
    baseId: USDC,
    ilkId: YVUSDC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.84'), // 105 / 125
    max: parseUnits('1000000', 6),
  },
  // WBTC
  {
    baseId: ETH,
    ilkId: WBTC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.7'), // 105 / 150
    max: parseUnits('100', 8),
  },
  {
    baseId: DAI,
    ilkId: WBTC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.7'), // 105 / 150
    max: parseUnits('100', 8),
  },
  {
    baseId: USDC,
    ilkId: WBTC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.7'), // 105 / 150
    max: parseUnits('100', 8),
  },
  {
    baseId: FRAX,
    ilkId: WBTC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.7'), // 105 / 150
    max: parseUnits('100', 8),
  },
  // WSTETH
  {
    baseId: ETH,
    ilkId: WSTETH,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.84'), // 105 / 125
    max: parseUnits('1000'),
  },
  {
    baseId: DAI,
    ilkId: WSTETH,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: USDC,
    ilkId: WSTETH,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: FRAX,
    ilkId: WSTETH,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  // LINK
  {
    baseId: ETH,
    ilkId: LINK,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.7'), // 105 / 150
    max: parseUnits('10000'),
  },
  {
    baseId: DAI,
    ilkId: LINK,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  {
    baseId: USDC,
    ilkId: LINK,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  {
    baseId: FRAX,
    ilkId: LINK,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  // ENS
  {
    baseId: ETH,
    ilkId: ENS,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.7'), // 105 / 150
    max: parseUnits('10000'),
  },
  {
    baseId: DAI,
    ilkId: ENS,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  {
    baseId: USDC,
    ilkId: ENS,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  {
    baseId: FRAX,
    ilkId: ENS,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  // UNI
  {
    baseId: ETH,
    ilkId: UNI,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.7'), // 105 / 150
    max: parseUnits('10000'),
  },
  {
    baseId: DAI,
    ilkId: UNI,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  {
    baseId: USDC,
    ilkId: UNI,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
  {
    baseId: FRAX,
    ilkId: UNI,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62'), // 105 / 167
    max: parseUnits('10000'),
  },
]

/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param initial percentage of the collateral to be offered (fixed point with 18 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const v1Limits: Array<[string, string, number, number, number]> = [
  [ETH, '720000000000000000', 0, 1500000, 12], // DAI/ETH is 72% LTV
  [DAI, '760000000000000000', 0, 5000, 18], // USDC/DAI is 76% LTV
  [USDC, '760000000000000000', 0, 5000, 6], // DAI/USDC is 76% LTV
  [WBTC, '670000000000000000', 0, 1200, 4], // ETH/WBTC is 67% LTV
  [WSTETH, '800000000000000000', 0, 1500000, 12], // ETH/WSTETH is 80% LTV
  [LINK, '670000000000000000', 0, 300, 18], // ETH/LINK is 67% LTV
  [ENS, '670000000000000000', 0, 250, 18], // ETH/ENS is 67% LTV
  [YVUSDC, '800000000000000000', 0, 5000, 6], // USDC/YVUSDC is 80% LTV
  [UNI, '670000000000000000', 0, 400, 18], // ETH/UNI is 67% LTV
  [FRAX, '910000000000000000', 0, 400, 18], // DAI/FRAX is 91% LTV
]
