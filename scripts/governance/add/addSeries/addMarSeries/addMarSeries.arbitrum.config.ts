import { BigNumber } from 'ethers'
import { ZERO, ZERO_ADDRESS, WAD, ONEUSDC, ONE64, secondsInOneYear } from '../../../../../shared/constants'
import { ETH, DAI, USDC } from '../../../../../shared/constants'
import { EOMAR23 } from '../../../../../shared/constants'
import { FYETH2303, FYDAI2303, FYUSDC2303 } from '../../../../../shared/constants'
import { YSETH6MMS, YSDAI6MMS, YSUSDC6MMS } from '../../../../../shared/constants'
import { ACCUMULATOR } from '../../../../../shared/constants'
import * as base_config from '../../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
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

/// @notice Time stretch to be set in the PoolFactory prior to pool deployment
/// @param series identifier (bytes6 tag)
/// @param time stretch (64.64)
export const timeStretch: Map<string, BigNumber> = new Map([
  [FYETH2303, ONE64.div(secondsInOneYear.mul(25))],
  [FYDAI2303, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDC2303, ONE64.div(secondsInOneYear.mul(55))],
])

/// @notice Sell base to the pool fee, as fp4
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
  [FYETH2303, ETH, protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string, EOMAR23, 'FYETH2303', 'FYETH2303'],
  [FYDAI2303, DAI, protocol.get(ACCUMULATOR) as string, joins.get(DAI) as string, EOMAR23, 'FYDAI2303', 'FYDAI2303'],
  [
    FYUSDC2303,
    USDC,
    protocol.get(ACCUMULATOR) as string,
    joins.get(USDC) as string,
    EOMAR23,
    'FYUSDC2303',
    'FYUSDC2303',
  ],
]

/// @notice Deploy plain YieldSpace pools
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param base address
/// @param fyToken address
/// @param time stretch, in 64.64
/// @param g1, in 64.64
export const nonTVPoolData: Array<[string, string, string, BigNumber, number]> = [
  [
    FYETH2303,
    assets.get(ETH) as string,
    newFYTokens.get(FYETH2303) as string,
    timeStretch.get(FYETH2303) as BigNumber,
    g1,
  ],
  [
    FYDAI2303,
    assets.get(DAI) as string,
    newFYTokens.get(FYDAI2303) as string,
    timeStretch.get(FYDAI2303) as BigNumber,
    g1,
  ],
  [
    FYUSDC2303,
    assets.get(USDC) as string,
    newFYTokens.get(FYUSDC2303) as string,
    timeStretch.get(FYUSDC2303) as BigNumber,
    g1,
  ],
]

/// @notice Pool initialization parameters
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param amount of base to initialize pool with
export const poolsInit: Array<[string, BigNumber]> = [
  [FYETH2303, WAD.div(10)],
  [FYDAI2303, WAD.mul(100)],
  [FYUSDC2303, ONEUSDC.mul(100)],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2303, [ETH, DAI, USDC]],
  [FYDAI2303, [ETH, DAI, USDC]],
  [FYUSDC2303, [ETH, DAI, USDC]],
]

/// Parameters to roll each strategy
/// @param strategyId
/// @param nextSeriesId
/// @param buffer Amount of base sent to the Roller to make up for market losses when using a flash loan for rolling
/// @param lender ERC3156 flash lender used for rolling
/// @param fix If true, transfer one base wei to the pool to allow the Strategy to start enhanced TV pools
export const rollData: Array<[string, string, BigNumber, string, boolean]> = [
  [YSETH6MMS, FYETH2303, ZERO, ZERO_ADDRESS, false],
  [YSDAI6MMS, FYDAI2303, ZERO, ZERO_ADDRESS, false],
  [YSUSDC6MMS, FYUSDC2303, ZERO, ZERO_ADDRESS, false],
]
