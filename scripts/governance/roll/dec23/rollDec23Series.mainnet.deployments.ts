import { BigNumber } from 'ethers'
import { ONE64, secondsInOneYear } from '../../../../shared/constants'
import { ETH, DAI, USDC, USDT, EODEC23, FYETH2312, FYDAI2312, FYUSDC2312, FYUSDT2312, FYFRAX2312 } from '../../../../shared/constants'
import { SAFE_ERC20_NAMER, YIELDMATH, ACCUMULATOR } from '../../../../shared/constants'

import { ContractDeployment } from '../../confTypes' // Note we use the series id as the asset id

import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as addresses from '../../addresses.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = addresses.governance
export const external: Map<string, string> = addresses.external
export const assets: Map<string, string> = addresses.assets
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const joins = () => readAddressMappingIfExists('joins.json')
export const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
export const pools = () => readAddressMappingIfExists('pools.json')
export const strategies = () => readAddressMappingIfExists('strsategies.json')

/// @notice Time stretch to be set in the PoolFactory prior to pool deployment
/// @dev Calculate as ln(3)/ln(1 + r * 0.85)↓, where:
//    r is the target APY, obtained from the Notional borrowing rate
//    0.85 is a factor to target a lower borrowing rate, closer to the average rate
//    we round down (↓) because when in doubt we err towards having less fyToken in the pools
/// i.e. 4% APY -> 0.04 * 0.85 = 0.034, ln(3)/ln(1 + 0.034) = 32
/// @param series identifier (bytes6 tag)
/// @param time stretch (64.64)
export const timeStretch: Map<string, BigNumber> = new Map([
  [FYETH2312, ONE64.div(secondsInOneYear.mul(30))],  // ln(3)/ln(1+ 0.0439 * 0.85) = 30
  [FYDAI2312, ONE64.div(secondsInOneYear.mul(26))],  // ln(3)/ln(1+ 0.0511 * 0.85) = 26
  [FYUSDC2312, ONE64.div(secondsInOneYear.mul(24))], // ln(3)/ln(1+ 0.0563 * 0.85) = 24
  [FYUSDT2312, ONE64.div(secondsInOneYear.mul(19))], // (25% higher than USDC in Aave) = ln(3)/ln(1+ 0.0563 * 1.25 * 0.85) = 19
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
    name: FYETH2312,
    contract: 'FYToken',
    args: [
      () => ETH,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins().getOrThrow(ETH)!,
      () => EODEC23,
      () => 'FYETH2312',
      () => 'FYETH2312',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },

  {
    addressFile: 'fyTokens.json',
    name: FYDAI2312,
    contract: 'FYToken',
    args: [
      () => DAI,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins().getOrThrow(DAI)!,
      () => EODEC23,
      () => 'FYDAI2312',
      () => 'FYDAI2312',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },

  {
    addressFile: 'fyTokens.json',
    name: FYUSDC2312,
    contract: 'FYToken',
    args: [
      () => USDC,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins().getOrThrow(USDC)!,
      () => EODEC23,
      () => 'FYUSDC2312',
      () => 'FYUSDC2312',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },

  {
    addressFile: 'fyTokens.json',
    name: FYUSDT2312,
    contract: 'FYToken',
    args: [
      () => USDT,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins().getOrThrow(USDT)!,
      () => EODEC23,
      () => 'FYUSDT2312',
      () => 'FYUSDT2312',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
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
    name: FYETH2312,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(ETH)!,
      () => fyTokens().getOrThrow(FYETH2312)!,
      () => timeStretch.get(FYETH2312)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },

  {
    addressFile: 'pools.json',
    name: FYDAI2312,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(DAI)!,
      () => fyTokens().getOrThrow(FYDAI2312)!,
      () => timeStretch.get(FYDAI2312)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },

  {
    addressFile: 'pools.json',
    name: FYUSDC2312,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(USDC)!,
      () => fyTokens().getOrThrow(FYUSDC2312)!,
      () => timeStretch.get(FYUSDC2312)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },

  {
    addressFile: 'pools.json',
    name: FYUSDT2312,
    contract: 'PoolNonTv',
    args: [
      () => assets.get(USDT)!,
      () => fyTokens().getOrThrow(FYUSDT2312)!,
      () => timeStretch.get(FYUSDT2312)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH)!,
    },
  },
]
