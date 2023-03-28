import { TOKEN_SWAP } from '../../../../shared/constants'

import { ContractDeployment } from '../../confTypes' // Note we use the series id as the asset id

import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
export const pools = () => readAddressMappingIfExists('pools.json')
export const strategies = () => readAddressMappingIfExists('strategies.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  /// @notice Deploy TokenSwap
  {
    addressFile: 'protocol.json',
    name: TOKEN_SWAP,
    contract: 'TokenSwap',
    args: [],
  },
]
