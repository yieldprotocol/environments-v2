import { LIMITED_ASSERT_V2 } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.mainnet.config'

import { ContractDeployment } from '../../../confTypes'

export const chainId: number = base_config.chainId
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const deployer: string = '0x1Bd3Abb6ef058408734EA01cA81D325039cd7bcA'
export const developer: string = '0x1Bd3Abb6ef058408734EA01cA81D325039cd7bcA'

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: LIMITED_ASSERT_V2,
    contract: 'Assert',
    args: [],
  },
]
