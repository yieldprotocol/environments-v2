import { BigNumber } from 'ethers'
import { ZERO, ZERO_ADDRESS, WAD, ONEUSDC, ONE64, secondsInOneYear } from '../../../../../shared/constants'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  LINK,
  ENS,
  UNI,
  FRAX,
  YVUSDC,
  EWETH,
  EDAI,
  EUSDC,
} from '../../../../../shared/constants'
import { EOJUN23 } from '../../../../../shared/constants'
import { FYETH2306, FYDAI2306, FYUSDC2306, FYFRAX2306 } from '../../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSFRAX6MJD } from '../../../../../shared/constants'
import { COMPOUND, ACCUMULATOR } from '../../../../../shared/constants'

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
export const eulerFlash = external.get('eulerFlash') as string

// Amount to be donated to the Joins in forks
export const joinLoans: Map<string, BigNumber> = new Map([[USDC, ONEUSDC.mul(500000)]])

/// @notice Time stretch to be set in the PoolFactory prior to pool deployment
/// @param series identifier (bytes6 tag)
/// @param time stretch (64.64)
export const timeStretch: Map<string, BigNumber> = new Map([
  [FYETH2306, ONE64.div(secondsInOneYear.mul(25))],
  [FYDAI2306, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDC2306, ONE64.div(secondsInOneYear.mul(55))],
  [FYFRAX2306, ONE64.div(secondsInOneYear.mul(20))],
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
  [FYDAI2306, DAI, protocol.get(COMPOUND) as string, joins.get(DAI) as string, EOJUN23, 'FYDAI2306', 'FYDAI2306'],
  [FYETH2306, ETH, protocol.get(COMPOUND) as string, joins.get(ETH) as string, EOJUN23, 'FYETH2306', 'FYETH2306'],
  [FYUSDC2306, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EOJUN23, 'FYUSDC2306', 'FYUSDC2306'],
  [
    FYFRAX2306,
    FRAX,
    protocol.get(ACCUMULATOR) as string,
    joins.get(FRAX) as string,
    EOJUN23,
    'FYFRAX2306',
    'FYFRAX2306',
  ],
]

/// @notice Deploy euler-backed YieldSpace pools
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param euler main address
/// @param euler token address
/// @param fyToken address
/// @param time stretch, in 64.64
/// @param g1, in 64.64
export const ePoolData: Array<[string, string, string, string, BigNumber, number]> = [
  [
    FYETH2306,
    euler,
    assets.get(EWETH) as string,
    newFYTokens.get(FYETH2306) as string,
    timeStretch.get(FYETH2306) as BigNumber,
    g1,
  ],
  [
    FYDAI2306,
    euler,
    assets.get(EDAI) as string,
    newFYTokens.get(FYDAI2306) as string,
    timeStretch.get(FYDAI2306) as BigNumber,
    g1,
  ],
  [
    FYUSDC2306,
    euler,
    assets.get(EUSDC) as string,
    newFYTokens.get(FYUSDC2306) as string,
    timeStretch.get(FYUSDC2306) as BigNumber,
    g1,
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
    FYFRAX2306,
    assets.get(FRAX) as string,
    newFYTokens.get(FYFRAX2306) as string,
    timeStretch.get(FYFRAX2306) as BigNumber,
    g1,
  ],
]

/// @notice Pool initialization parameters
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param amount of base to initialize pool with
export const poolsInit: Array<[string, BigNumber]> = [
  [FYETH2306, WAD.div(10)],
  [FYDAI2306, WAD.mul(100)],
  [FYUSDC2306, ONEUSDC.mul(100)],
  [FYFRAX2306, WAD.mul(100)],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  [FYDAI2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  [FYUSDC2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC]],
  [FYFRAX2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
]

/// Parameters to roll each strategy
/// @param strategyId
/// @param nextSeriesId
/// @param buffer Amount of base sent to the Roller to make up for market losses when using a flash loan for rolling
/// @param lender ERC3156 flash lender used for rolling
/// @param fix If true, transfer one base wei to the pool to allow the Strategy to start enhanced TV pools
export const rollData: Array<[string, string, BigNumber, string, boolean]> = [
  [YSETH6MJD, FYETH2306, ZERO, ZERO_ADDRESS, true],
  [YSDAI6MJD, FYDAI2306, ZERO, ZERO_ADDRESS, true],
  [YSUSDC6MJD, FYUSDC2306, ZERO, ZERO_ADDRESS, true],
  [YSFRAX6MJD, FYFRAX2306, ZERO, ZERO_ADDRESS, false],
]
