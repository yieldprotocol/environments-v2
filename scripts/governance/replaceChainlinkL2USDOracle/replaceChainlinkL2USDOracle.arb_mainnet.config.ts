import * as base_config from '../base.arb_mainnet.config'

import { ETH, DAI, USDC } from '../../../shared/constants'
import { CHAINLINKUSD } from '../../../shared/constants'

export const governance = base_config.governance
export const protocol = base_config.protocol
export const assets = base_config.assets

export const chainId = 42161
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const sequencerFlags: string = '0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83'

export const chainlinkUSDSources: Array<[string, string, string]> = [
  [ETH, assets.get(ETH) as string, '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612'],
  [DAI, assets.get(DAI) as string, '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB'],
  [USDC, assets.get(USDC) as string, '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3'],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const assetPairs: Array<[string, string, string]> = [
  [DAI, ETH, protocol.get(CHAINLINKUSD) as string],
  [DAI, DAI, protocol.get(CHAINLINKUSD) as string],
  [DAI, USDC, protocol.get(CHAINLINKUSD) as string],
  [USDC, ETH, protocol.get(CHAINLINKUSD) as string],
  [USDC, DAI, protocol.get(CHAINLINKUSD) as string],
  [USDC, USDC, protocol.get(CHAINLINKUSD) as string],
]
