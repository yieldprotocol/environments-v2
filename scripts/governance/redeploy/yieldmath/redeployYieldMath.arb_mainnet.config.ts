import { YIELDMATH } from '../../../../shared/constants'
import { ContractDeployment } from '../../confTypes'
import * as base_config from '../../base.arb_mainnet.config'

export const deployer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const developer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const governance: Map<string, string> = base_config.governance

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: YIELDMATH,
    contract: 'YieldMath',
    args: [],
  },
]
