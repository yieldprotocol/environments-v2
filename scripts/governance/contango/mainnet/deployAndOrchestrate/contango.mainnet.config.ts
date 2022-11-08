import { parseUnits } from 'ethers/lib/utils'

import * as base_config from '../../../base.mainnet.config'

export const developer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'
export const deployer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

import {
  CHAINLINK,
  CHI,
  DAI,
  ETH,
  FRAX,
  FYDAI2303,
  FYETH2303,
  FYFRAX2303,
  FYUSDC2303,
  RATE,
  USDC,
  WAD,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../../shared/constants'
import { AuctionLineAndLimit, SeriesToAdd } from '../../../confTypes' // Note we use the series id as the asset id

export const rateChiSources: Array<[string, string, string, string]> = [
  [DAI, RATE, WAD.toString(), WAD.toString()],
  [DAI, CHI, WAD.toString(), WAD.toString()],
  [USDC, RATE, WAD.toString(), WAD.toString()],
  [USDC, CHI, WAD.toString(), WAD.toString()],
  [ETH, RATE, WAD.toString(), WAD.toString()],
  [ETH, CHI, WAD.toString(), WAD.toString()],
  [FRAX, RATE, WAD.toString(), WAD.toString()],
  [FRAX, CHI, WAD.toString(), WAD.toString()],
]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, joins.getOrThrow(DAI)],
  [USDC, joins.getOrThrow(USDC)],
  [ETH, joins.getOrThrow(ETH)],
  [FRAX, joins.getOrThrow(FRAX)],
]

// Input data: baseId, quoteId, oracle name
export const compositeSources: Array<[string, string, string]> = [
  [FYDAI2303, DAI, protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE)],
  [FYFRAX2303, FRAX, protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE)],
  [FYUSDC2303, USDC, protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE)],
  [FYETH2303, ETH, protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE)],
  [ETH, USDC, protocol.getOrThrow(CHAINLINK)],
  [ETH, DAI, protocol.getOrThrow(CHAINLINK)],
  [ETH, FRAX, protocol.getOrThrow(CHAINLINK)],
  [DAI, USDC, protocol.getOrThrow(CHAINLINK)],
  [DAI, FRAX, protocol.getOrThrow(CHAINLINK)],
  [USDC, FRAX, protocol.getOrThrow(CHAINLINK)],
]

// Input data: assetId, assetId, [intermediate assetId]
export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, FYUSDC2303, [USDC]],
  [DAI, FYETH2303, [ETH]],
  [DAI, FYFRAX2303, [FRAX]],
  [USDC, FYDAI2303, [DAI]],
  [USDC, FYETH2303, [ETH]],
  [USDC, FYFRAX2303, [FRAX]],
  [ETH, FYUSDC2303, [USDC]],
  [ETH, FYDAI2303, [DAI]],
  [ETH, FYFRAX2303, [FRAX]],
  [FRAX, FYUSDC2303, [USDC]],
  [FRAX, FYETH2303, [ETH]],
  [FRAX, FYDAI2303, [DAI]],
]

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
/// @param Address for the join
export const assetsToAdd: Array<[string, string, string]> = [
  [DAI, assets.getOrThrow(DAI), joins.getOrThrow(DAI)],
  [USDC, assets.getOrThrow(USDC), joins.getOrThrow(USDC)],
  [ETH, assets.getOrThrow(ETH), joins.getOrThrow(ETH)],
  [FRAX, assets.getOrThrow(FRAX), joins.getOrThrow(FRAX)],
  [FYDAI2303, fyTokens.getOrThrow(FYDAI2303), joins.getOrThrow(FYDAI2303)],
  [FYUSDC2303, fyTokens.getOrThrow(FYUSDC2303), joins.getOrThrow(FYUSDC2303)],
  [FYETH2303, fyTokens.getOrThrow(FYETH2303), joins.getOrThrow(FYETH2303)],
  [FYFRAX2303, fyTokens.getOrThrow(FYFRAX2303), joins.getOrThrow(FYFRAX2303)],
]

export const seriesToAdd: SeriesToAdd[] = [
  {
    seriesId: FYDAI2303,
    fyToken: fyTokens.getOrThrow(FYDAI2303),
  },
  {
    seriesId: FYUSDC2303,
    fyToken: fyTokens.getOrThrow(FYUSDC2303),
  },
  {
    seriesId: FYETH2303,
    fyToken: fyTokens.getOrThrow(FYETH2303),
  },
  {
    seriesId: FYFRAX2303,
    fyToken: fyTokens.getOrThrow(FYFRAX2303),
  },
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
/// @notice Collateralisation parameters and debt limits for each new asset pair
/// @param Base asset identifier (bytes6 tag)
/// @param Collateral asset identifier (bytes6 tag)
/// @param Collateralisation ratio, with six decimals
/// @param Maximum protocol debt, decimals to be added
/// @param Minimum vault debt, decimals to be added
/// @param Decimals to add to maximum protocol debt, and minimum vault debt.
export const fyTokenDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, FYUSDC2303, 1100000, 10000, 1000, 18], // dai collateralised with fyUSDC
  [DAI, FYFRAX2303, 1100000, 10000, 1000, 18], // dai collateralised with fyFRAX
  [DAI, FYETH2303, 1400000, 10000, 1000, 18], // dai collateralised with fyETH
  [USDC, FYDAI2303, 1100000, 10000, 1000, 6], // usdc collateralised with fyDAI
  [USDC, FYFRAX2303, 1100000, 10000, 1000, 6], // usdc collateralised with fyFRAX
  [USDC, FYETH2303, 1400000, 10000, 1000, 6], // usdc collateralised with fyETH
  [ETH, FYUSDC2303, 1400000, 10, 1, 18], // eth collateralised with fyUSDC
  [ETH, FYDAI2303, 1400000, 10, 1, 18], // eth collateralised with fyDAI
  [ETH, FYFRAX2303, 1400000, 10, 1, 18], // eth collateralised with fyFRAX
  [FRAX, FYUSDC2303, 1100000, 10000, 1000, 18], // dai collateralised with fyUSDC
  [FRAX, FYDAI2303, 1100000, 10000, 1000, 18], // dai collateralised with fyDAI
  [FRAX, FYETH2303, 1400000, 10000, 1000, 18], // dai collateralised with fyETH
]

export const auctionLineAndLimits: AuctionLineAndLimit[] = [
  // ETH
  {
    baseId: ETH,
    ilkId: FYUSDC2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000', 6),
  },
  {
    baseId: ETH,
    ilkId: FYDAI2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000'),
  },
  {
    baseId: ETH,
    ilkId: FYFRAX2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000'),
  },
  // USDC
  {
    baseId: USDC,
    ilkId: FYETH2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: USDC,
    ilkId: FYDAI2303,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
  {
    baseId: USDC,
    ilkId: FYFRAX2303,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
  // DAI
  {
    baseId: DAI,
    ilkId: FYETH2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: DAI,
    ilkId: FYUSDC2303,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000', 6),
  },
  {
    baseId: DAI,
    ilkId: FYFRAX2303,
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
  [FYDAI2303, [FYUSDC2303, FYETH2303, FYFRAX2303]],
  [FYUSDC2303, [FYDAI2303, FYETH2303, FYFRAX2303]],
  [FYETH2303, [FYUSDC2303, FYDAI2303, FYFRAX2303]],
  [FYFRAX2303, [FYUSDC2303, FYDAI2303, FYETH2303]],
]
