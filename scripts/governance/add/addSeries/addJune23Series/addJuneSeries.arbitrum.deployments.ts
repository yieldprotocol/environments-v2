import { BigNumber } from 'ethers'
import { ZERO, ZERO_ADDRESS, WAD, ONEUSDC, ONE64, secondsInOneYear } from '../../../../../shared/constants'
import { ETH, DAI, USDC } from '../../../../../shared/constants'
import { EOJUN23 } from '../../../../../shared/constants'
import { FYETH2212, FYDAI2212, FYUSDC2212, FYETH2306, FYDAI2306, FYUSDC2306 } from '../../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD } from '../../../../../shared/constants'
import { ACCUMULATOR } from '../../../../../shared/constants'

import { ContractDeployment } from '../../../confTypes' // Note we use the series id as the asset id

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
export const pools = () => readAddressMappingIfExists('pools.json')
export const strategies = () => readAddressMappingIfExists('strategies.json')
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

/// @notice Time stretch to be set in the PoolFactory prior to pool deployment
/// @param series identifier (bytes6 tag)
/// @param time stretch (64.64)
export const timeStretch: Map<string, BigNumber> = new Map([
  [FYETH2306, ONE64.div(secondsInOneYear.mul(25))],
  [FYDAI2306, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDC2306, ONE64.div(secondsInOneYear.mul(55))],
])

/// @notice Sell base to the pool fee, as fp4
export const g1: number = 9000

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  /// @notice Deploy fyToken series
  /// @param underlying identifier (bytes6 tag)
  /// @param Address for the chi oracle
  /// @param Address for the related Join
  /// @param Maturity in unix time (seconds since Jan 1, 1970)
  /// @param Name for the series
  /// @param Symbol for the series
  {
    addressFile: 'fyTokens.json',
    name: FYETH2306,
    contract: 'FYToken',
    args: [
      () => ETH,
      () => protocol().getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(ETH),
      () => EOJUN23,
      () => 'FYETH2306',
      () => 'FYETH2306',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'fyTokens.json',
    name: FYDAI2306,
    contract: 'FYToken',
    args: [
      () => ETH,
      () => protocol().getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(DAI),
      () => EOJUN23,
      () => 'FYDAI2306',
      () => 'FYDAI2306',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'fyTokens.json',
    name: FYUSDC2306,
    contract: 'FYToken',
    args: [
      () => USDC,
      () => protocol().getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(USDC),
      () => EOJUN23,
      () => 'FYUSDC2306',
      () => 'FYUSDC2306',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  /// @notice Deploy plain YieldSpace pools
  /// @param pool identifier, usually matching the series (bytes6 tag)
  /// @param base address
  /// @param fyToken address
  /// @param time stretch, in 64.64
  /// @param g1, in 64.64
  {
    addressFile: 'pools.json',
    name: FYETH2306,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(ETH)!,
      () => fyTokens().getOrThrow(FYETH2306)!,
      () => timeStretch.get(FYETH2306)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow('yieldMath')!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYDAI2306,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(DAI)!,
      () => fyTokens().getOrThrow(FYDAI2306)!,
      () => timeStretch.get(FYDAI2306)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow('yieldMath')!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDC2306,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(USDC)!,
      () => fyTokens().getOrThrow(FYUSDC2306)!,
      () => timeStretch.get(FYUSDC2306)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow('yieldMath')!,
    },
  },
  /// @notice Deploy strategies
  /// @param strategy name
  /// @param strategy identifier (bytes6 tag)
  /// @param Address for the Ladle
  /// @param Address for the underlying asset
  /// @param Underlying asset identifier (bytes6 tag)
  /// @param Address for the underlying asset join
  {
    addressFile: 'strategies.json',
    name: YSETH6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy ETH 6M Jun Dec', () => YSETH6MJD, () => 18, () => fyTokens().getOrThrow(FYETH2212)!],
  },
  {
    addressFile: 'strategies.json',
    name: YSDAI6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy DAI 6M Jun Dec', () => YSDAI6MJD, () => 18, () => fyTokens().getOrThrow(FYDAI2212)!],
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDC6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDC 6M Jun Dec', () => YSUSDC6MJD, () => 6, () => fyTokens().getOrThrow(FYUSDC2212)!],
  },
]

/// @notice Pool initialization parameters
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param amount of base to initialize pool with
export const poolsInit: Array<[string, BigNumber]> = [
  [FYETH2306, WAD.div(10)],
  [FYDAI2306, WAD.mul(100)],
  [FYUSDC2306, ONEUSDC.mul(100)],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2306, [ETH, DAI, USDC]],
  [FYDAI2306, [ETH, DAI, USDC]],
  [FYUSDC2306, [ETH, DAI, USDC]],
]

/// Parameters to roll each strategy
/// @param strategyId
/// @param nextSeriesId
/// @param buffer Amount of base sent to the Roller to make up for market losses when using a flash loan for rolling
/// @param lender ERC3156 flash lender used for rolling
/// @param fix If true, transfer one base wei to the pool to allow the Strategy to start enhanced TV pools
export const rollData: Array<[string, string, BigNumber, string, boolean]> = [
  [YSETH6MJD, FYETH2306, ZERO, ZERO_ADDRESS, false],
  [YSDAI6MJD, FYDAI2306, ZERO, ZERO_ADDRESS, false],
  [YSUSDC6MJD, FYUSDC2306, ZERO, ZERO_ADDRESS, false],
]
