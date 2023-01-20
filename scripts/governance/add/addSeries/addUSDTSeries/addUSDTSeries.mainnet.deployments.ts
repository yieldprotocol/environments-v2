import { BigNumber } from 'ethers'
import {
  ACCUMULATOR,
  CHI,
  DAI,
  EOJUN22,
  EOSEP22,
  ETH,
  FYUSDT2212,
  FYUSDT2303,
  ONE64,
  RATE,
  secondsInOneYear,
  FRAX,
  USDC,
  EWETH,
  WBTC,
  LINK,
  STETH,
  WSTETH,
  ENS,
  UNI,
  WAD,
  YSUSDT6MMS,
  YSUSDT6MJD,
  USDT,
  EUSDT,
  ZERO,
  COMPOUND,
  EOMAR23,
  EODEC22,
  CHAINLINK,
  FYETH2206,
  FYUSDC2206,
  FYDAI2206,
  FYDAI2209,
  FYETH2209,
  FYUSDC2209,
  YIELDMATH,
  LADLE,
  ONEUSDC,
} from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const deployer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const whales: Map<string, string> = base_config.whales
export const eulerAddress = base_config.eulerAddress
export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const newFYTokens = () => readAddressMappingIfExists('newFYTokens.json')
export const newJoins = () => readAddressMappingIfExists('newJoins.json')
export const newPools = () => readAddressMappingIfExists('newPools.json')
export const newStrategies = () => readAddressMappingIfExists('newStrategies.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')

import { ContractDeployment, Accumulator, OracleSource, OraclePath, Asset } from '../../../confTypes'

const ONEUSDT = ONEUSDC

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
export const assetsToAdd: Map<string, string> = new Map([[USDT, assets.get(USDT) as string]])

export const timeStretch: Map<string, BigNumber> = new Map([
  [FYUSDT2212, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDT2303, ONE64.div(secondsInOneYear.mul(45))],
]) // todo: Allan

// Sell base to the pool fee, as fp4
export const g1: number = 9000 // todo: Allan

// ----- CONTRACT DEPLOYMENTS -----

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'newJoins.json',
    name: USDT,
    contract: 'Join',
    args: [() => assets.get(USDT) as string],
  },
  //  {
  //    addressFile: 'newFYTokens.json',
  //    name: FYUSDT2212,
  //    contract: 'FYToken',
  //    args: [
  //      () => USDT,
  //      () => protocol().get(COMPOUND) as string,
  //      () => newJoins().get(USDT) as string,
  //      () => EODEC22.toString(),
  //      () => 'FYUSDT2212',
  //      () => 'FYUSDT2212',
  //    ],
  //    libs: {
  //      SafeERC20Namer: protocol().get('safeERC20Namer')!,
  //    },
  //  },
  //  {
  //    addressFile: 'newPools.json',
  //    name: FYUSDT2212,
  //    contract: 'PoolEuler',
  //    args: [
  //      () => eulerAddress,
  //      () => assets.get(EUSDT) as string,
  //      () => newFYTokens().get(FYUSDT2212) as string,
  //      () => timeStretch.get(FYUSDT2212)!.toString(),
  //      () => g1.toString(),
  //    ],
  //    libs: {
  //      YieldMath: protocol().get('yieldMath')!,
  //    },
  //  },
  //  {
  //    addressFile: 'newStrategies.json',
  //    name: YSUSDT6MJD,
  //    contract: 'Strategy',
  //    args: [
  //      () => 'Yield Strategy USDT 6M Jun Dec',
  //      () => YSUSDT6MJD,
  //      () => protocol().get(LADLE)!,
  //      () => assets.get(USDT)!,
  //      () => FRAX,
  //      () => newJoins().get(USDT)!,
  //    ],
  //    libs: {
  //      SafeERC20Namer: protocol().get('safeERC20Namer')!,
  //    },
  //  },
]
