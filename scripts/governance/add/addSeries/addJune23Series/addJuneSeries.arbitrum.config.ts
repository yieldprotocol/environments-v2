import { ETH, DAI, USDC } from '../../../../../shared/constants'
import { FYETH2306, FYDAI2306, FYUSDC2306 } from '../../../../../shared/constants'
import {
  YSETH6MJD,
  YSDAI6MJD,
  YSUSDC6MJD,
  YSETH6MJD_V1,
  YSDAI6MJD_V1,
  YSUSDC6MJD_V1,
} from '../../../../../shared/constants'

import * as base_config from '../../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const strategies: Map<string, string> = base_config.strategies
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2306, [ETH, DAI, USDC]],
  [FYDAI2306, [ETH, DAI, USDC]],
  [FYUSDC2306, [ETH, DAI, USDC]],
]

/// Parameters to roll each strategy
/// @param source strategy
/// @param seriesId(poolId) on the destination strategy
/// @param destination strategy
/// @param pool to invest in
export const migrateData: Array<[string, string, string, string]> = [
  [
    strategies.getOrThrow(YSETH6MJD_V1)!,
    FYETH2306,
    newStrategies.getOrThrow(YSETH6MJD)!,
    newPools.getOrThrow(FYETH2306)!,
  ],
  [
    strategies.getOrThrow(YSDAI6MJD_V1)!,
    FYDAI2306,
    newStrategies.getOrThrow(YSDAI6MJD)!,
    newPools.getOrThrow(FYDAI2306)!,
  ],
  [
    strategies.getOrThrow(YSUSDC6MJD_V1)!,
    FYUSDC2306,
    newStrategies.getOrThrow(YSUSDC6MJD)!,
    newPools.getOrThrow(FYUSDC2306)!,
  ],
]