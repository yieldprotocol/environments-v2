import { parseUnits } from 'ethers/lib/utils'

import * as base_config from '../../../base.arb_mainnet.config'
import {
  DAI,
  ETH,
  FYDAI2303,
  FYETH2303,
  FYUSDC2303,
  USDC,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../../shared/constants'
import { AuctionLineAndLimit } from '../../../confTypes' // Note we use the series id as the asset id

export const developer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'
export const deployer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

// Input data: baseId, quoteId, oracle name
export const compositeSources: Array<[string, string, string]> = [
  [FYDAI2303, DAI, protocol.get(YIELD_SPACE_MULTI_ORACLE)!],
  [FYUSDC2303, USDC, protocol.get(YIELD_SPACE_MULTI_ORACLE)!],
  [FYETH2303, ETH, protocol.get(YIELD_SPACE_MULTI_ORACLE)!],
]
// Input data: assetId, assetId, [intermediate assetId]
export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, FYUSDC2303, [USDC]],
  [USDC, FYDAI2303, [DAI]],
  [DAI, FYETH2303, [ETH]],
  [USDC, FYETH2303, [ETH]],
  [ETH, FYDAI2303, [DAI]],
  [ETH, FYUSDC2303, [USDC]],
]

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
/// @param Address for the join
export const assetsToAdd: Array<[string, string, string]> = [
  [FYDAI2303, fyTokens.get(FYDAI2303)!, newJoins.get(FYDAI2303)!],
  [FYUSDC2303, fyTokens.get(FYUSDC2303)!, newJoins.get(FYUSDC2303)!],
  [FYETH2303, fyTokens.get(FYETH2303)!, newJoins.get(FYETH2303)!],
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
  [DAI, FYUSDC2303, 1100000, 10000, 40, 18], // dai collateralized with fyUsdc
  [DAI, FYETH2303, 1400000, 10000, 40, 18], // dai collateralized with fyEth
  [USDC, FYDAI2303, 1100000, 10000, 40, 6], // usdc collateralized with fyDai
  [USDC, FYETH2303, 1400000, 10000, 40, 6], // usdc collateralized with fyETH
  [ETH, FYUSDC2303, 1400000, 10000000, 25000, 12], // eth collateralized with fyUsdc
  [ETH, FYDAI2303, 1400000, 10000000, 25000, 12], // eth collateralized with fyDai
]

export const auctionLineAndLimits: AuctionLineAndLimit[] = [
  // ETH
  {
    baseId: ETH,
    ilkId: FYUSDC2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('500'),
  },
  {
    baseId: ETH,
    ilkId: FYDAI2303,
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
    max: parseUnits('500'),
  },
  {
    baseId: USDC,
    ilkId: FYDAI2303,
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
    max: parseUnits('500'),
  },
  {
    baseId: DAI,
    ilkId: FYUSDC2303,
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
  [FYDAI2303, [FYUSDC2303, FYETH2303]],
  [FYUSDC2303, [FYDAI2303, FYETH2303]],
  [FYETH2303, [FYUSDC2303, FYDAI2303]],
]
