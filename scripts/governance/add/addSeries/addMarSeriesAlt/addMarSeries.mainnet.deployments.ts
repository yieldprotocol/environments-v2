import { BigNumber } from 'ethers'
import { ONE64, secondsInOneYear } from '../../../../../shared/constants'
import { ETH, DAI, USDC, FRAX, EWETH, EDAI, EUSDC, EULER } from '../../../../../shared/constants'
import { EOMAR23 } from '../../../../../shared/constants'
import { FYETH2303, FYDAI2303, FYUSDC2303, FYFRAX2303 } from '../../../../../shared/constants'
import { SAFE_ERC20_NAMER, YIELDMATH, COMPOUND, ACCUMULATOR } from '../../../../../shared/constants'

import { ContractDeployment } from '../../../confTypes' // Note we use the series id as the asset id

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const external: Map<string, string> = base_config.external
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
  [FYETH2303, ONE64.div(secondsInOneYear.mul(25))],
  [FYDAI2303, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDC2303, ONE64.div(secondsInOneYear.mul(55))],
  [FYFRAX2303, ONE64.div(secondsInOneYear.mul(20))],
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
    name: FYETH2303,
    contract: 'FYToken',
    args: [
      () => ETH,
      () => protocol().getOrThrow(COMPOUND),
      () => joins.getOrThrow(ETH),
      () => EOMAR23,
      () => 'FYETH2303',
      () => 'FYETH2303',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'newFYTokens.json',
    name: FYDAI2303,
    contract: 'FYToken',
    args: [
      () => DAI,
      () => protocol().getOrThrow(COMPOUND),
      () => joins.getOrThrow(DAI),
      () => EOMAR23,
      () => 'FYDAI2303',
      () => 'FYDAI2303',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'newFYTokens.json',
    name: FYUSDC2303,
    contract: 'FYToken',
    args: [
      () => USDC,
      () => protocol().getOrThrow(COMPOUND),
      () => joins.getOrThrow(USDC),
      () => EOMAR23,
      () => 'FYUSDC2303',
      () => 'FYUSDC2303',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'newFYTokens.json',
    name: FYFRAX2303,
    contract: 'FYToken',
    args: [
      () => FRAX,
      () => protocol().getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(FRAX),
      () => EOMAR23,
      () => 'FYFRAX2303',
      () => 'FYFRAX2303',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  /// @notice Deploy plain YieldSpace pools
  /// @param pool identifier, usually matching the series (bytes6 tag)
  /// @param euler main address
  /// @param shares address
  /// @param fyToken address
  /// @param time stretch, in 64.64
  /// @param g1, in 64.64
  {
    addressFile: 'newPools.json',
    name: FYETH2303,
    contract: 'PoolEuler',
    args: [
      () => external.getOrThrow(EULER)!,
      () => assets.get(EWETH)!,
      () => newFYTokens().getOrThrow(FYETH2303)!,
      () => timeStretch.get(FYETH2303)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'newPools.json',
    name: FYDAI2303,
    contract: 'PoolEuler',
    args: [
      () => external.getOrThrow(EULER)!,
      () => assets.get(EDAI)!,
      () => newFYTokens().getOrThrow(FYDAI2303)!,
      () => timeStretch.get(FYDAI2303)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'newPools.json',
    name: FYUSDC2303,
    contract: 'PoolEuler',
    args: [
      () => external.getOrThrow(EULER)!,
      () => assets.get(EUSDC)!,
      () => newFYTokens().getOrThrow(FYUSDC2303)!,
      () => timeStretch.get(FYUSDC2303)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
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
    name: FYFRAX2303,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(FRAX)!,
      () => newFYTokens().getOrThrow(FYFRAX2303)!,
      () => timeStretch.get(FYFRAX2303)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
]
