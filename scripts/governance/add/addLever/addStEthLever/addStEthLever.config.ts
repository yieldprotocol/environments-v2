import { GIVER, YIELD_STETH_LEVER } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import * as base_config from '../../../base.mainnet.config'
import { ContractDeployment } from '../../../confTypes'

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
    name: YIELD_STETH_LEVER,
    contract: 'YieldStEthLever',
    args: [() => protocol().getOrThrow(GIVER)],
  },
]
