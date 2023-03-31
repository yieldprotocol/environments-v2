import { LIMITED_ASSERT_V2 } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.mainnet.config'

import { ContractDeployment } from '../../../confTypes'

export const chainId: number = base_config.chainId
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const deployer: string = '0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7'
export const developer: string = '0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7'

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: LIMITED_ASSERT_V2,
    contract: 'Assert',
    args: [],
  },
]
