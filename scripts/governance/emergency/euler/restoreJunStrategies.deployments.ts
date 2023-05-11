import { BigNumber } from 'ethers'
import { ONE64, secondsInOneYear } from '../../../../shared/constants'
import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { EOJUN23 } from '../../../../shared/constants'
import { FYETH2306B, FYDAI2306B, FYUSDC2306B, FYUSDT2306B } from '../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSUSDT6MJD } from '../../../../shared/constants'
import { SAFE_ERC20_NAMER, YIELDMATH, ACCUMULATOR, COMPOUND, EULER } from '../../../../shared/constants'

import { ContractDeployment } from '../../confTypes' // Note we use the series id as the asset id

import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
export const pools = () => readAddressMappingIfExists('pools.json')
export const strategies = () => readAddressMappingIfExists('strategies.json')

/// @notice Time stretch to be set in the PoolFactory prior to pool deployment
/// @param series identifier (bytes6 tag)
/// @param time stretch (64.64)
export const timeStretch: Map<string, BigNumber> = new Map([
  [FYETH2306B, ONE64.div(secondsInOneYear.mul(25))],
  [FYDAI2306B, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDC2306B, ONE64.div(secondsInOneYear.mul(55))],
  [FYUSDT2306B, ONE64.div(secondsInOneYear.mul(45))],
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
    name: FYETH2306B,
    contract: 'FYToken',
    args: [
      () => ETH,
      () => protocol.getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(ETH),
      () => EOJUN23,
      () => 'FYETH2306B',
      () => 'FYETH2306B',
    ],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'fyTokens.json',
    name: FYDAI2306B,
    contract: 'FYToken',
    args: [
      () => DAI,
      () => protocol.getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(DAI),
      () => EOJUN23,
      () => 'FYDAI2306B',
      () => 'FYDAI2306B',
    ],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'fyTokens.json',
    name: FYUSDC2306B,
    contract: 'FYToken',
    args: [
      () => USDC,
      () => protocol.getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(USDC),
      () => EOJUN23,
      () => 'FYUSDC2306B',
      () => 'FYUSDC2306B',
    ],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'fyTokens.json',
    name: FYUSDT2306B,
    contract: 'FYToken',
    args: [
      () => USDT,
      () => protocol.getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(USDT),
      () => EOJUN23,
      () => 'FYUSDT2306B',
      () => 'FYUSDT2306B',
    ],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
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
    name: FYETH2306B,
    contract: 'PoolNonTv',
    args: [
      () => assets.getOrThrow(ETH)!,
      () => fyTokens().getOrThrow(FYETH2306B)!,
      () => timeStretch.get(FYETH2306B)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol.getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYDAI2306B,
    contract: 'PoolNonTv',
    args: [
      () => assets.getOrThrow(DAI)!,
      () => fyTokens().getOrThrow(FYDAI2306B)!,
      () => timeStretch.get(FYDAI2306B)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol.getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDC2306B,
    contract: 'PoolNonTv',
    args: [
      () => assets.getOrThrow(USDC)!,
      () => fyTokens().getOrThrow(FYUSDC2306B)!,
      () => timeStretch.get(FYUSDC2306B)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol.getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDT2306B,
    contract: 'PoolNonTv',
    args: [
      () => assets.getOrThrow(USDT)!,
      () => fyTokens().getOrThrow(FYUSDT2306B)!,
      () => timeStretch.get(FYUSDT2306B)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol.getOrThrow(YIELDMATH)!,
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
    args: [() => 'Yield Strategy ETH 6M Jun Dec', () => 'YSETH6MJD', () => fyTokens().getOrThrow(FYETH2306B)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSDAI6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy DAI 6M Jun Dec', () => 'YSDAI6MJD', () => fyTokens().getOrThrow(FYDAI2306B)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDC6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDC 6M Jun Dec', () => 'YSUSDC6MJD', () => fyTokens().getOrThrow(FYUSDC2306B)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDT6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDT 6M Jun Dec', () => 'YSUSDT6MJD', () => fyTokens().getOrThrow(FYUSDT2306B)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
]
