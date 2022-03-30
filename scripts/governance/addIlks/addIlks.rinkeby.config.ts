import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC } from '../../../shared/constants'
import { FYETH2206, FYDAI2206, FYUSDC2206, FYETH2209, FYDAI2209, FYUSDC2209 } from '../../../shared/constants'

import * as base_config from '../base.rinkeby.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  //  [FYDAI2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  //  [FYUSDC2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
  [FYETH2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  //  [FYDAI2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  //  [FYUSDC2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
]
