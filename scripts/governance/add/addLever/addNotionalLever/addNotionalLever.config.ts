import {
  FYDAI2303,
  FYDAI2306,
  FYETH2303,
  FYETH2306,
  FYUSDC2303,
  FYUSDC2306,
  GIVER,
  YIELD_NOTIONAL_LEVER,
} from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.mainnet.config'

import { ContractDeployment } from '../../../confTypes'

export const chainId: number = base_config.chainId
export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const protocol = () => readAddressMappingIfExists('protocol.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: YIELD_NOTIONAL_LEVER,
    contract: 'YieldNotionalLever',
    args: [() => protocol().getOrThrow(GIVER)],
  },
]
