import * as base_config from '../../base.arb_mainnet.config'

import { ETH, CAULDRON, REPAY_FROM_LADLE_MODULE } from '../../../../shared/constants'

import { readAddressMappingIfExists } from '../../../../shared/helpers'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets
export const protocol = () => readAddressMappingIfExists('protocol.json')

import { ContractDeployment } from '../../confTypes'

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: REPAY_FROM_LADLE_MODULE,
    contract: 'RepayFromLadleModule',
    args: [() => protocol().getOrThrow(CAULDRON) as string, () => assets.getOrThrow(ETH) as string],
  },
]
