import { ASSERT } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.mainnet.config'

import { ContractDeployment } from '../../../confTypes'

export const chainId: number = base_config.chainId
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const developer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: ASSERT,
    contract: 'Assert',
    args: [],
  },
]
