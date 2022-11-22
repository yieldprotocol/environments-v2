import { BigNumber } from 'ethers'
import { ZERO, ZERO_ADDRESS, WAD, ONEUSDC, ONE64, secondsInOneYear } from '../../../../../shared/constants'
import { ETH, DAI, USDC } from '../../../../../shared/constants'
import { EOJUN23 } from '../../../../../shared/constants'
import { FYETH2306, FYDAI2306, FYUSDC2306 } from '../../../../../shared/constants'
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
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategies: Map<string, string> = base_config.strategies
export const newFYTokens = () => readAddressMappingIfExists('newFYTokens.json')
export const newPools = () => readAddressMappingIfExists('newPools.json')
export const newStrategies = () => readAddressMappingIfExists('newStrategies.json')

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
    addressFile: 'newFYTokens.json',
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
    addressFile: 'newFYTokens.json',
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
    addressFile: 'newFYTokens.json',
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
    addressFile: 'newPools.json',
    name: FYETH2306,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(ETH)!,
      () => newFYTokens().getOrThrow(FYETH2306)!,
      () => timeStretch.get(FYETH2306)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow('yieldMath')!,
    },
  },
  {
    addressFile: 'newPools.json',
    name: FYDAI2306,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(DAI)!,
      () => newFYTokens().getOrThrow(FYDAI2306)!,
      () => timeStretch.get(FYDAI2306)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow('yieldMath')!,
    },
  },
  {
    addressFile: 'newPools.json',
    name: FYUSDC2306,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(USDC)!,
      () => newFYTokens().getOrThrow(FYUSDC2306)!,
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
    addressFile: 'newStrategies.json',
    name: YSETH6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy ETH 6M Jun Dec', () => YSETH6MJD, () => newFYTokens().getOrThrow(FYETH2306)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'newStrategies.json',
    name: YSDAI6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy DAI 6M Jun Dec', () => YSDAI6MJD, () => newFYTokens().getOrThrow(FYDAI2306)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'newStrategies.json',
    name: YSUSDC6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDC 6M Jun Dec', () => YSUSDC6MJD, () => newFYTokens().getOrThrow(FYUSDC2306)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
]
