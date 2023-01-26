import { BigNumber } from 'ethers'
import {
  ACCUMULATOR,
  SAFE_ERC20_NAMER,
  EULER,
  USDT,
  EUSDT,
  FYUSDT2303,
  FYUSDT2306,
  EOMAR23,
  EOJUN23,
  ONE64,
  secondsInOneYear,
  YSUSDT6MMS,
  YSUSDT6MJD,
} from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const deployer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const whales: Map<string, string> = base_config.whales
export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
export const joins = () => readAddressMappingIfExists('joins.json')
export const pools = () => readAddressMappingIfExists('pools.json')
export const strategies = () => readAddressMappingIfExists('strategies.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')

import { ContractDeployment } from '../../../confTypes'

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
export const assetsToAdd: Map<string, string> = new Map([[USDT, assets.get(USDT) as string]])

export const timeStretch: Map<string, BigNumber> = new Map([
  [FYUSDT2303, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDT2306, ONE64.div(secondsInOneYear.mul(45))],
]) // todo: Allan

// Sell base to the pool fee, as fp4
export const g1: number = 9000 // todo: Allan

// ----- CONTRACT DEPLOYMENTS -----

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'joins.json',
    name: USDT,
    contract: 'FlashJoin',
    args: [() => assets.getOrThrow(USDT)!],
  },
  {
    addressFile: 'fyTokens.json',
    name: FYUSDT2303,
    contract: 'FYToken',
    args: [
      () => USDT,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins().getOrThrow(USDT)!,
      () => EOMAR23.toString(),
      () => 'FYUSDT2303',
      () => 'FYUSDT2303',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'fyTokens.json',
    name: FYUSDT2306,
    contract: 'FYToken',
    args: [
      () => USDT,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins().getOrThrow(USDT)!,
      () => EOJUN23.toString(),
      () => 'FYUSDT2306',
      () => 'FYUSDT2306',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDT2303, // Starting from the September series, pools get their own identifiers different from the fyToken
    contract: 'PoolEuler',
    args: [
      () => external.getOrThrow(EULER)!,
      () => assets.getOrThrow(EUSDT)!,
      () => fyTokens().getOrThrow(FYUSDT2303)!,
      () => timeStretch.get(FYUSDT2303)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow('yieldMath')!,
    },
  },
  {
    addressFile: 'pools.json',
    name: FYUSDT2306, // Starting from the September series, pools get their own identifiers different from the fyToken
    contract: 'PoolEuler',
    args: [
      () => external.getOrThrow(EULER)!,
      () => assets.getOrThrow(EUSDT)!,
      () => fyTokens().getOrThrow(FYUSDT2306)!,
      () => timeStretch.getOrThrow(FYUSDT2306)!.toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow('yieldMath')!,
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
    args: [() => 'Yield Strategy USDT 6M Mar Sep', () => 'YSUSDT6MJD', () => fyTokens().getOrThrow(FYUSDT2303)!],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER)!,
    },
  },
]
