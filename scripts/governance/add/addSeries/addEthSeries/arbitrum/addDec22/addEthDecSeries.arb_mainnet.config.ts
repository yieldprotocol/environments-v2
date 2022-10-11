import { BigNumber } from 'ethers'
import { ZERO, WAD, ONE64, secondsInOneYear } from '../../../../../../../shared/constants'
import { ETH, DAI, USDC } from '../../../../../../../shared/constants'
import { EODEC22, FYETH2212, YSETH6MJD, ACCUMULATOR } from '../../../../../../../shared/constants'

import * as base_config from '../../../../../base.arb_mainnet.config'

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

// Time stretch to be set in the PoolFactory prior to pool deployment
export const timeStretch: Map<string, BigNumber> = new Map([[FYETH2212, ONE64.div(secondsInOneYear.mul(25))]])

// Sell base to the pool fee, as fp4
export const g1: number = 9000

/// @notice Deploy fyToken series
/// @param series identifier (bytes6 tag)
/// @param underlying identifier (bytes6 tag)
/// @param Address for the chi oracle
/// @param Address for the related Join
/// @param Maturity in unix time (seconds since Jan 1, 1970)
/// @param Name for the series
/// @param Symbol for the series
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYETH2212, ETH, protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string, EODEC22, 'FYETH2212', 'FYETH2212'],
]

/// @notice Deploy YieldSpace-tv:NonTv pools
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param base address
/// @param fyToken address
/// @param time stretch, in 64.64
/// @param g1, in 64.64
export const nonTVPoolData: Array<[string, string, string, BigNumber, number]> = [
  [
    FYETH2212,
    assets.get(ETH) as string,
    newFYTokens.get(FYETH2212) as string,
    timeStretch.get(FYETH2212) as BigNumber,
    g1,
  ],
]

/// @notice Pool initialization parameters
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param base identifier (bytes6 tag)
/// @param amount of base to initialize pool with
/// @param amount of fyToken to initialize pool with
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [[FYETH2212, ETH, WAD.div(50), ZERO]]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [[FYETH2212, [ETH, DAI, USDC]]]

/// @notice Deploy strategies
/// @param strategy name
/// @param strategy identifier (bytes6 tag)
/// @param base
/// @param Address for the related Join
/// @param Address for the related asset
export const strategiesData: Array<[string, string, string, string, string]> = [
  ['Yield Strategy ETH 6M Jun Dec', YSETH6MJD, ETH, joins.get(ETH) as string, assets.get(ETH) as string],
]

/// @notice Strategy initialization parameters
/// @param strategy identifier (bytes6 tag)
/// @param address of initial pool
/// @param series identifier (bytes6 tag)
/// @param amount of base to initialize strategy with
export const strategiesInit: Array<[string, string, string, BigNumber]> = [
  [YSETH6MJD, newPools.get(FYETH2212) as string, FYETH2212, WAD.div(50)],
]
