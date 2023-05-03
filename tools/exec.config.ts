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
    "0xD28380De0e7093AC62bCb88610b9f4f4Fb58Be74"
  ],
  [
    "0x0031FF00028C",
    "0x60995D90B45169eB04F1ea9463443a62B83ab1c1"
  ],
  [
    "0x0032FF00028C",
    "0x257F43cc0936b288d652D60C6d67B11f5eb35269"
  ],
  [
    "0x00A0FF00028C",
    "0x3252DeafFa4cA66C54db8BCC2865ED229922d989"
  ]
])

export const trades = [
  [pools.get('0x00A0FF00028B')!, 1000000],
  [pools.get('0x00A0FF00028E')!, 1000000],
]
