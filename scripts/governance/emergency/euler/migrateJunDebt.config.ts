import { CAULDRON, SHIFTER } from '../../../../shared/constants'
import { FYETH2306B, FYDAI2306B, FYUSDC2306B, FYUSDT2306B } from '../../../../shared/constants'

import { ContractDeployment } from '../../confTypes'

import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales
export const deployers: Map<string, string> = base_config.deployers

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
  {
    addressFile: 'protocol.json',
    name: SHIFTER,
    contract: 'Shifter',
    args: [() => protocol.getOrThrow(CAULDRON)],
  },
]

export const vaultsToMigrate = [
  ['0xc91d2860721578b155112427', FYUSDC2306B],
  ['0xaaa4a659f38142cb9229897f', FYDAI2306B],
  ['0xb2b7ba4a5553b851d133ab88', FYUSDC2306B],
  ['0xca797edf3a94d93ace3165a9', FYUSDC2306B],
  ['0xf5a882a0fa6d3784fa45d14c', FYETH2306B],
  ['0x0af96d60a61a6316ce6b7f16', FYUSDC2306B],
  ['0xcd091e62f27b5c7e7b520e7d', FYUSDC2306B],
]
