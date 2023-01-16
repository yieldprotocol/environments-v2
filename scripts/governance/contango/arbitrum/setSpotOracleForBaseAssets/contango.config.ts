import { COMPOSITE, DAI, ETH, USDC } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import * as base_config from '../../../base.arb_mainnet.config'

export const developer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'
export const deployers = readAddressMappingIfExists('deployers.json')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

export const spotOracles = [
  [DAI, ETH, protocol.getOrThrow(COMPOSITE), 100_000000], // We don't wanna borrow this asset, so we set the ratio to 10000%
  [USDC, ETH, protocol.getOrThrow(COMPOSITE), 100_000000], // We don't wanna borrow this asset, so we set the ratio to 10000%
]
