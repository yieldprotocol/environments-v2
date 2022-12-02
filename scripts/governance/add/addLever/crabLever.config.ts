import { CAULDRON, GIVER, YIELD_CRAB_LEVER } from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.arb_mainnet.config'

import { ContractDeployment } from '../../confTypes'

export const chainId: number = base_config.chainId
export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: YIELD_CRAB_LEVER,
    contract: 'YieldCrabLever',
    args: [() => protocol().getOrThrow(GIVER)],
  },
]
