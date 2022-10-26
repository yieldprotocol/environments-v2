import { ContractDeployment } from '../../confTypes'

import { TIMELOCK, CLOAK, MULTISIG } from '../../../../shared/constants'

import * as base_config from '../../base.arb_mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategies: Map<string, string> = base_config.strategies
export const external: Map<string, string> = base_config.external

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'governance.json',
    name: CLOAK,
    contract: 'EmergencyBrake',
    args: [governance.get(MULTISIG)!, governance.get(TIMELOCK)!, developer],
  },
]
