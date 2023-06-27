import { BigNumber } from 'ethers'
import { ONE64, secondsInOneYear } from '../../../../shared/constants'
import { ETH, DAI, USDC, FRAX, EWETH, EDAI, EUSDC } from '../../../../shared/constants'
import { EOSEP23 } from '../../../../shared/constants'
import { FYETH2309, FYDAI2309, FYUSDC2309, FYFRAX2309 } from '../../../../shared/constants'
import { YSETH6MMS, YSDAI6MMS, YSUSDC6MMS, YSFRAX6MMS } from '../../../../shared/constants'
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
export const timeStretch: Map<string, BigNumber> = new Map([[FYFRAX2309, ONE64.div(secondsInOneYear.mul(45))]])

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
    name: FYFRAX2309,
    contract: 'FYToken',
    args: [
      () => FRAX,
      () => protocol.getOrThrow(ACCUMULATOR),
      () => joins.getOrThrow(FRAX),
      () => EOSEP23,
      () => 'FYFRAX2309',
      () => 'FYFRAX2309',
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
    name: FYFRAX2309,
    contract: 'PoolNonTv',
    args: [
      () => assets.getOrThrow(FRAX)!,
      () => fyTokens().getOrThrow(FYFRAX2309)!,
      () => timeStretch.get(FYFRAX2309)!.toString(),
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
    name: YSFRAX6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy FRAX 6M Mar Sep', () => 'YSFRAX6MMS', () => fyTokens().getOrThrow(FYFRAX2309)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
]
