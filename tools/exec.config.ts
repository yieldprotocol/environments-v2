import * as base_config from '../scripts/governance/base.mainnet.config'

export const chainId: number = base_config.chainId
export const assets: Map<string, string> = base_config.assets
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const fyTokens: Map<string, string> = base_config.fyTokens
// export const pools: Map<string, string> = base_config.pools

export const developer = base_config.developer

export const pools: Map<string, string> = new Map([
  [
    "0x0030FF00028C",
    "0x60995D90B45169eB04F1ea9463443a62B83ab1c1"
  ],
  [
    "0x0031FF00028C",
    "0x910f4b26EC52E71faE8944021E385FDBfC4Fa8C3"
  ],
  [
    "0x0032FF00028C",
    "0x0bdF152f6d899F4B63b9554ED98D9b9d22FFdee4"
  ],
  [
    "0x00A0FF00028C",
    "0xaCd0523Aca72CC58EC2f3d4C14F5473FC11c5C2D"
  ]
])

export const trades = [
  [pools.get('0x00A0FF00028B')!, 1000000],
  [pools.get('0x00A0FF00028E')!, 1000000],
]
