import * as base_config from '../base.arb_rinkeby.config'

import { ETH, DAI, USDC } from '../../../shared/constants'
import { CHAINLINKUSD } from '../../../shared/constants'

export const governance = base_config.governance
export const protocol = base_config.protocol
export const assets = base_config.assets

export const chainId = 421611
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const sequencerFlags: string = '0x491B1dDA0A8fa069bbC1125133A975BF4e85a91b'

export const chainlinkUSDSources: Array<[string, string, string]> = [
  [ETH, assets.get(ETH) as string, '0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8'],
  [DAI, assets.get(DAI) as string, '0xcAE7d280828cf4a0869b26341155E4E9b864C7b2'],
  [USDC, assets.get(USDC) as string, '0xe020609A0C31f4F96dCBB8DF9882218952dD95c4'],
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