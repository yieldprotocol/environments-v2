import { LIMITED_ASSERT } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.mainnet.config'

import { ContractDeployment } from '../../../confTypes'

export const chainId: number = base_config.chainId
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: LIMITED_ASSERT,
    contract: 'Assert',
    args: [],
  },
]
