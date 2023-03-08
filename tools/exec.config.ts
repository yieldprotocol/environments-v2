import * as base_config from '../scripts/governance/base.mainnet.config'

export const chainId: number = base_config.chainId
export const pools: Map<string, string> = base_config.pools
export const developer = base_config.developer

export const trades = [
  [pools.get('0x00A0FF00028B')!, 1000000],
  [pools.get('0x00A0FF00028E')!, 1000000],
]
