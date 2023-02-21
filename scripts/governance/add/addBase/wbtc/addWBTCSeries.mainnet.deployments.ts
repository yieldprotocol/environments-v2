import { BigNumber } from 'ethers'
import {
  ACCUMULATOR,
  YIELDMATH,
  SAFE_ERC20_NAMER,
  EULER,
  WBTC,
  EWBTC,
  FYWBTC2303,
  FYWBTC2306,
  EOMAR23,
  EOJUN23,
  ONE64,
  secondsInOneYear,
  YSWBTC6MMS,
  YSWBTC6MJD,
  DISPLAY_NAMES,
} from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'
export const deployer: string = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'
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
export const assetsToAdd: Map<string, string> = new Map([[WBTC, assets.get(WBTC) as string]])

export const timeStretch: Map<string, BigNumber> = new Map([
  [FYWBTC2303, ONE64.div(secondsInOneYear.mul(35))],
  [FYWBTC2306, ONE64.div(secondsInOneYear.mul(35))],
]) // todo: Allan

// Sell base to the pool fee, as fp4
export const g1: number = 9000 // todo: Allan

// ----- CONTRACT DEPLOYMENTS -----

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'joins.json',
    name: WBTC,
    contract: 'Join', // TODO check
    args: [() => assets.getOrThrow(WBTC)],
  },
  {
    addressFile: 'fyTokens.json',
    name: FYWBTC2303,
    contract: 'FYToken',
    args: [
      () => WBTC,
      () => protocol().getOrThrow(ACCUMULATOR),
      () => joins().getOrThrow(WBTC),
      () => EOMAR23.toString(),
      () => DISPLAY_NAMES.get(FYWBTC2303),
      () => DISPLAY_NAMES.get(FYWBTC2303),
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER),
    },
  },
  {
    addressFile: 'fyTokens.json',
    name: FYWBTC2306,
    contract: 'FYToken',
    args: [
      () => WBTC,
      () => protocol().getOrThrow(ACCUMULATOR),
      () => joins().getOrThrow(WBTC),
      () => EOJUN23.toString(),
      () => DISPLAY_NAMES.get(FYWBTC2306),
      () => DISPLAY_NAMES.get(FYWBTC2306),
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER),
    },
  },
  {
    addressFile: 'pools.json',
    name: FYWBTC2303, // Starting from the September series, pools get their own identifiers different from the fyToken
    contract: 'PoolEuler',
    args: [
      () => external.getOrThrow(EULER),
      () => assets.getOrThrow(EWBTC),
      () => fyTokens().getOrThrow(FYWBTC2303),
      () => timeStretch.getOrThrow(FYWBTC2303).toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH),
    },
  },
  {
    addressFile: 'pools.json',
    name: FYWBTC2306, // Starting from the September series, pools get their own identifiers different from the fyToken
    contract: 'PoolEuler',
    args: [
      () => external.getOrThrow(EULER),
      () => assets.getOrThrow(EWBTC),
      () => fyTokens().getOrThrow(FYWBTC2306),
      () => timeStretch.getOrThrow(FYWBTC2306).toString(),
      () => g1.toString(),
    ],
    libs: {
      YieldMath: protocol().getOrThrow(YIELDMATH),
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSWBTC6MJD,
    contract: 'Strategy',
    args: [
      () => 'Yield Strategy WBTC 6M Jun Dec',
      () => DISPLAY_NAMES.get(YSWBTC6MJD),
      () => fyTokens().getOrThrow(FYWBTC2306),
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER),
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSWBTC6MMS,
    contract: 'Strategy',
    args: [
      () => 'Yield Strategy WBTC 6M Mar Sep',
      () => DISPLAY_NAMES.get(YSWBTC6MMS),
      () => fyTokens().getOrThrow(FYWBTC2303),
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow(SAFE_ERC20_NAMER),
    },
  },
]
