import { BigNumber } from 'ethers'
import { ONE64, secondsInOneYear } from '../../../../shared/constants'
import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { FYETH2306, FYETH2309, FYDAI2306, FYDAI2309, FYUSDC2306, FYUSDC2309, FYUSDT2306, FYUSDT2309 } from '../../../../shared/constants'
import { YSETH6MJD, YSETH6MMS, YSDAI6MJD, YSDAI6MMS, YSUSDC6MJD, YSUSDC6MMS, YSUSDT6MJD, YSUSDT6MMS } from '../../../../shared/constants'
import { SAFE_ERC20_NAMER, YIELDMATH } from '../../../../shared/constants'

import { ContractDeployment } from '../../confTypes'

import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const external: Map<string, string> = base_config.external
export const assets: Map<string, string> = base_config.assets
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const joins = () => readAddressMappingIfExists('joins.json')
export const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
export const pools = () => readAddressMappingIfExists('pools.json')
export const strategies = () => readAddressMappingIfExists('strsategies.json')

/// @notice Time stretch to be set in the PoolFactory prior to pool deployment
/// @param series identifier (bytes6 tag)
/// @param time stretch (64.64)
export const timeStretch: Map<string, BigNumber> = new Map([
  [FYETH2306, ONE64.div(secondsInOneYear.mul(35))],
  [FYETH2309, ONE64.div(secondsInOneYear.mul(35))],
  [FYDAI2306, ONE64.div(secondsInOneYear.mul(35))],
  [FYDAI2309, ONE64.div(secondsInOneYear.mul(35))],
  [FYUSDC2306, ONE64.div(secondsInOneYear.mul(35))],
  [FYUSDC2309, ONE64.div(secondsInOneYear.mul(35))],
  [FYUSDT2306, ONE64.div(secondsInOneYear.mul(35))],
  [FYUSDT2309, ONE64.div(secondsInOneYear.mul(35))],
])

/// @notice Sell base to the pool fee, as fp4
export const g1: number = 9000

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
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
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYETH2309,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(ETH)!,
      () => fyTokens().getOrThrow(FYETH2309)!,
      () => timeStretch.get(FYETH2309)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
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
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYDAI2309,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(DAI)!,
      () => fyTokens().getOrThrow(FYDAI2309)!,
      () => timeStretch.get(FYDAI2309)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
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
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDC2309,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(USDC)!,
      () => fyTokens().getOrThrow(FYUSDC2309)!,
      () => timeStretch.get(FYUSDC2309)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDT2306,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(USDT)!,
      () => fyTokens().getOrThrow(FYUSDT2306)!,
      () => timeStretch.get(FYUSDT2306)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDT2309,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(USDT)!,
      () => fyTokens().getOrThrow(FYUSDT2309)!,
      () => timeStretch.get(FYUSDT2309)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
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
    args: [() => 'Yield Strategy ETH 6M Jun Dec', () => 'YSETH6MJD', () => fyTokens().getOrThrow(FYETH2306)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSETH6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy ETH 6M Mar Sep', () => 'YSETH6MMS', () => fyTokens().getOrThrow(FYETH2309)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSDAI6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy DAI 6M Jun Dec', () => 'YSDAI6MJD', () => fyTokens().getOrThrow(FYDAI2306)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSDAI6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy DAI 6M Mar Sep', () => 'YSDAI6MMS', () => fyTokens().getOrThrow(FYDAI2309)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDC6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDC 6M Jun Dec', () => 'YSUSDC6MJD', () => fyTokens().getOrThrow(FYUSDC2306)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDC6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDC 6M Mar Sep', () => 'YSUSDC6MMS', () => fyTokens().getOrThrow(FYUSDC2309)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDT6MJD,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDT 6M Jun Dec', () => 'YSUSDT6MJD', () => fyTokens().getOrThrow(FYUSDT2306)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDT6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDT 6M Mar Sep', () => 'YSUSDT6MMS', () => fyTokens().getOrThrow(FYUSDT2309)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
]
