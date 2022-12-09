import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC } from '../../../../../shared/constants'
import { FYETH2303, FYDAI2303, FYUSDC2303, FYFRAX2303 } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const strategies: Map<string, string> = base_config.strategies
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies
export const euler = external.get('euler') as string

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2303, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  [FYDAI2303, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  [FYUSDC2303, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC]],
  [FYFRAX2303, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
]
