import * as base_config from '../scripts/governance/base.mainnet.config'

export const chainId: number = base_config.chainId
export const assets: Map<string, string> = base_config.assets
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools

export const developer = base_config.developer

export const trades = [
  [pools.get('0x00A0FF00028B')!, 1000000],
  [pools.get('0x00A0FF00028E')!, 1000000],
]
