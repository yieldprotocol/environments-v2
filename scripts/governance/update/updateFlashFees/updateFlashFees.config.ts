import {
  FYDAI2303,
  FYDAI2306,
  FYETH2303,
  FYETH2306,
  FYUSDC2303,
  FYUSDC2306,
  ETH,
  DAI,
  USDC,
} from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import * as base_config from '../../base.mainnet.config'

export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const protocol = () => readAddressMappingIfExists('protocol.json')

/// @notice Flashfeefactor to be set on asset's join
/// @param assetId
/// @param flashFeeAmount
export const joinFlashFees: [string, number][] = [
  [ETH, 0],
  [DAI, 0],
  [USDC, 0],
]

/// @notice Flashfeefactor to be set on fyTokens
/// @param seriesId
/// @param flashFee
export const fyTokenFlashFees: [string, number][] = [
  [FYETH2303, 0],
  [FYDAI2303, 0],
  [FYUSDC2303, 0],
  [FYETH2306, 0],
  [FYDAI2306, 0],
  [FYUSDC2306, 0],
]
