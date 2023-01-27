import {
  FYDAI2303,
  FYDAI2306,
  FYETH2303,
  FYETH2306,
  FYUSDC2303,
  FYUSDC2306,
  GIVER,
  YIELD_STETH_LEVER,
} from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import * as base_config from '../../base.mainnet.config'
import { ContractDeployment } from '../../confTypes'

export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: YIELD_STETH_LEVER,
    contract: 'YieldStEthLever',
    args: [() => protocol().getOrThrow(GIVER)],
  },
]

/// @notice Flashfeefactor to be set on asset's join
/// @param assetId
/// @param flashFeeAmount
export const joinFlashFees: [string, string][] = [
  ['0x303000000000', '0'],
  ['0x303100000000', '0'],
  ['0x303200000000', '0'],
]

/// @notice Flashfeefactor to be set on fyTokens
/// @param seriesId
/// @param flashFee
export const fyTokenFlashFees: [string, string][] = [
  [FYETH2303, '0'], //FYETH2303
  [FYDAI2303, '0'], //FYDAI2303
  [FYUSDC2303, '0'], //FYUSDC2303
  [FYETH2306, '0'], //FYETH2306
  [FYDAI2306, '0'], //FYDAI2306
  [FYUSDC2306, '0'], //FYUSDC2306
]
