import {
  FYETH2203,
  FYETH2206,
  WBTC,
  LINK,
  WSTETH,
  ENS,
} from '../../../shared/constants'

import * as base_config from '../base.rinkeby.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2203, [WBTC, LINK, WSTETH, ENS]],
  [FYETH2206, [WBTC, LINK, WSTETH, ENS]],
]