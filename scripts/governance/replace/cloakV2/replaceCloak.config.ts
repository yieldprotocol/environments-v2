import { ContractDeployment } from '../../confTypes'

import {
  TIMELOCK,
  CLOAK,
  MULTISIG,
  CAULDRON,
  WITCH,
  LADLE,
  GIVER,
  ROLLER,
  YIELD_STRATEGY_LEVER,
  WITCH_V1,
} from '../../../../shared/constants'

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
    args: [() => governance.get(MULTISIG)!, () => governance.get(TIMELOCK)!, () => developer],
  },
]

export const executors = [
  '0xC7aE076086623ecEA2450e364C838916a043F9a8', // Alberto Cuesta Cañada
  '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB', // Prafful Sahu
  '0xfe90d993367bc93D171A5ED88ab460759DE2bED6', // Richie Humpfrey
  '0x9152F1f95b0819DA526BF6e0cB800559542b5b25', // James Thompson
  '0x05950b4e68f103d5aBEf20364dE219a247e59C23', // Bruno Bonnano
  '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497', // Egill Hreinsson
  '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1', // Marco Mariscal
]

export const users: Array<string> = [protocol.getOrThrow(LADLE), protocol.getOrThrow(WITCH)]

fyTokens.forEach((value: string) => {
  users.push(value)
})
