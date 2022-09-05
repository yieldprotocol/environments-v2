import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import * as base_config from '../../base.arb_mainnet.config'

export const developer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'
export const deployer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

import { USDC, DAI, FYDAI2209, FYUSDC2209, CHAINLINKUSD, IDENTITY, ETH, FYETH2209 } from '../../../../shared/constants' // Note we use the series id as the asset id

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, joins.get(DAI) as string],
  [USDC, joins.get(USDC) as string],
  [ETH, joins.get(ETH) as string],
]

// Input data: baseId, quoteId, oracle name
export const compositeSources: Array<[string, string, string]> = [
  [FYDAI2209, DAI, IDENTITY],
  [FYUSDC2209, USDC, IDENTITY],
  [FYETH2209, ETH, IDENTITY],
  [DAI, USDC, CHAINLINKUSD],
  [ETH, USDC, CHAINLINKUSD],
  [ETH, DAI, CHAINLINKUSD],
]
// Input data: assetId, assetId, [intermediate assetId]
export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, FYUSDC2209, [USDC]],
  [USDC, FYDAI2209, [DAI]],
  [DAI, FYETH2209, [ETH]],
  [USDC, FYETH2209, [ETH]],
  [ETH, FYDAI2209, [DAI]],
  [ETH, FYUSDC2209, [USDC]],
]

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
/// @param Address for the join
export const assetsToAdd: Array<[string, string, string]> = [
  [DAI, assets.get(DAI) as string, joins.get(DAI) as string],
  [USDC, assets.get(USDC) as string, joins.get(USDC) as string],
  [ETH, assets.get(ETH) as string, joins.get(ETH) as string],
  [FYDAI2209, fyTokens.get(FYDAI2209) as string, newJoins.get(FYDAI2209) as string],
  [FYUSDC2209, fyTokens.get(FYUSDC2209) as string, newJoins.get(FYUSDC2209) as string],
  [FYETH2209, fyTokens.get(FYETH2209) as string, newJoins.get(FYETH2209) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
/// @notice Collateralization parameters and debt limits for each new asset pair
/// @param Base asset identifier (bytes6 tag)
/// @param Collateral asset identifier (bytes6 tag)
/// @param Collateralization ratio, with six decimals
/// @param Maximum protocol debt, decimals to be added
/// @param Minimum vault debt, decimals to be added
/// @param Decimals to add to maximum protocol debt, and minimum vault debt.
export const fyTokenDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, FYUSDC2209, 1100000, 10000, 40, 18], // dai collateralized with fyUsdc
  [DAI, FYETH2209, 1400000, 10000, 40, 18], // dai collateralized with fyEth
  [USDC, FYDAI2209, 1100000, 10000, 40, 6], // usdc collateralized with fyDai
  [USDC, FYETH2209, 1400000, 10000, 40, 6], // usdc collateralized with fyETH
  [ETH, FYUSDC2209, 1400000, 10000000, 25000, 12], // eth collateralized with fyUsdc
  [ETH, FYDAI2209, 1400000, 10000000, 25000, 12], // eth collateralized with fyDai
]

export interface AuctionLineAndLimit {
  baseId: string
  ilkId: string
  duration: number
  vaultProportion: BigNumber
  collateralProportion: BigNumber
  max: BigNumber
}
export const auctionLineAndLimits: AuctionLineAndLimit[] = [
  // ETH
  {
    baseId: ETH,
    ilkId: FYUSDC2209,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('500'),
  },
  {
    baseId: ETH,
    ilkId: FYDAI2209,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000'),
  },
  // USDC
  {
    baseId: USDC,
    ilkId: FYETH2209,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('500'),
  },
  {
    baseId: USDC,
    ilkId: FYDAI2209,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
  // DAI
  {
    baseId: DAI,
    ilkId: FYETH2209,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('500'),
  },
  {
    baseId: DAI,
    ilkId: FYUSDC2209,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
]

// Input data: seriesId, [ilkIds]
/// @notice New asset pairs to be accepted
/// @param Base asset identifier (bytes6 tag)
/// @param Array of collateral asset identifiers (bytes6 tag array)
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [FYUSDC2209, FYETH2209]],
  [FYUSDC2209, [FYDAI2209, FYETH2209]],
  [FYETH2209, [FYUSDC2209, FYDAI2209]],
]
