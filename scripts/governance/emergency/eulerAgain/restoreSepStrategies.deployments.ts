import { BigNumber } from 'ethers'
import { ONE64, secondsInOneYear } from '../../../../shared/constants'
import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { EOSEP23 } from '../../../../shared/constants'
import { FYETH2309, FYDAI2309, FYUSDC2309, FYUSDT2309 } from '../../../../shared/constants'
import { YSETH6MMS, YSDAI6MMS, YSUSDC6MMS, YSUSDT6MMS } from '../../../../shared/constants'
import { SAFE_ERC20_NAMER, YIELDMATH, ACCUMULATOR, COMPOUND, POOL_RESTORER, LADLE } from '../../../../shared/constants'

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
  [FYETH2309, ONE64.div(secondsInOneYear.mul(25))],
  [FYDAI2309, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDC2309, ONE64.div(secondsInOneYear.mul(55))],
  [FYUSDT2309, ONE64.div(secondsInOneYear.mul(45))],
])

/// @notice Sell base to the pool fee, as fp4
export const g1: number = 9000

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  /// @notice Deploy strategies
  /// @param strategy name
  /// @param strategy identifier (bytes6 tag)
  /// @param Address for the Ladle
  /// @param Address for the underlying asset
  /// @param Underlying asset identifier (bytes6 tag)
  /// @param Address for the underlying asset join
  {
    addressFile: 'strategies.json',
    name: YSETH6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy ETH 6M Mar Sep', () => 'YSETH6MMS', () => fyTokens().getOrThrow(FYETH2309)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSDAI6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy DAI 6M Mar Sep', () => 'YSDAI6MMS', () => fyTokens().getOrThrow(FYDAI2309)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDC6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDC 6M Mar Sep', () => 'YSUSDC6MMS', () => fyTokens().getOrThrow(FYUSDC2309)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSUSDT6MMS,
    contract: 'Strategy',
    args: [() => 'Yield Strategy USDT 6M Mar Sep', () => 'YSUSDT6MMS', () => fyTokens().getOrThrow(FYUSDT2309)!],
    libs: {
      SafeERC20Namer: protocol.getOrThrow(SAFE_ERC20_NAMER)!,
    },
  }
]
