import { BigNumber } from 'ethers'
import {
  ZERO,
  ZERO_ADDRESS,
  WAD,
  ONEUSDC,
  MAX256,
  ONE64,
  secondsIn25Years,
  secondsInOneYear,
} from '../../../../../shared/constants'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  LINK,
  ENS,
  UNI,
  FRAX,
  YVDAI,
  YVUSDC,
  EWETH,
  EDAI,
  EUSDC,
} from '../../../../../shared/constants'
import { EODEC22 } from '../../../../../shared/constants'
import { FYETH2212, FYDAI2212, FYUSDC2212, FYFRAX2212 } from '../../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSFRAX6MJD } from '../../../../../shared/constants'
import { COMPOUND, ACCUMULATOR } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const strategies: Map<string, string> = base_config.strategies
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies
export const eulerAddress = base_config.eulerAddress
export const flashMintModule = '0x1EB4CF3A948E7D72A198fe073cCb8C7a948cD853'

// Time stretch to be set in the PoolFactory prior to pool deployment
export const timeStretch: Map<string, BigNumber> = new Map([
  [FYETH2212, ONE64.div(secondsInOneYear.mul(25))],
  [FYDAI2212, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDC2212, ONE64.div(secondsInOneYear.mul(55))],
  [FYFRAX2212, ONE64.div(secondsInOneYear.mul(20))],
])

// Sell base to the pool fee, as fp4
export const g1: number = 9000

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYETH2212, ETH, protocol.get(COMPOUND) as string, joins.get(ETH) as string, EODEC22, 'FYETH2212', 'FYETH2212'],
  [FYDAI2212, DAI, protocol.get(COMPOUND) as string, joins.get(DAI) as string, EODEC22, 'FYDAI2212', 'FYDAI2212'],
  [FYUSDC2212, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EODEC22, 'FYUSDC2212', 'FYUSDC2212'],
  [
    FYFRAX2212,
    FRAX,
    protocol.get(ACCUMULATOR) as string,
    joins.get(FRAX) as string,
    EODEC22,
    'FYFRAX2212',
    'FYFRAX2212',
  ],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee)
export const yvPoolData: Array<[string, string, string, BigNumber, number]> = [
  //  [FYUSDC2212, assets.get(YVUSDC) as string, newFYTokens.get(FYUSDC2212) as string, timeStretch, g1],
  //  [FYDAI2212, assets.get(YVDAI) as string, newFYTokens.get(FYDAI2212) as string, timeStretch, g1],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee)
export const nonTVPoolData: Array<[string, string, string, BigNumber, number]> = [
  [
    FYFRAX2212,
    assets.get(FRAX) as string,
    newFYTokens.get(FYFRAX2212) as string,
    timeStretch.get(FYFRAX2212) as BigNumber,
    g1,
  ],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee)
export const ePoolData: Array<[string, string, string, string, BigNumber, number]> = [
  [
    FYETH2212,
    eulerAddress,
    assets.get(EWETH) as string,
    newFYTokens.get(FYETH2212) as string,
    timeStretch.get(FYETH2212) as BigNumber,
    g1,
  ],
  [
    FYDAI2212,
    eulerAddress,
    assets.get(EDAI) as string,
    newFYTokens.get(FYDAI2212) as string,
    timeStretch.get(FYDAI2212) as BigNumber,
    g1,
  ],
  [
    FYUSDC2212,
    eulerAddress,
    assets.get(EUSDC) as string,
    newFYTokens.get(FYUSDC2212) as string,
    timeStretch.get(FYUSDC2212) as BigNumber,
    g1,
  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYETH2212, ETH, WAD.div(10), BigNumber.from('0')],
  [FYDAI2212, DAI, WAD.mul(100), BigNumber.from('0')],
  [FYUSDC2212, USDC, ONEUSDC.mul(100), BigNumber.from('0')],
  [FYFRAX2212, FRAX, WAD.mul(100), BigNumber.from('0')],
]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  [FYDAI2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  [FYUSDC2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC]],
  [FYFRAX2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
]

/// Parameters to roll each strategy
/// @param strategyId
/// @param nextSeriesId
/// @param buffer Amount of base sent to the Roller to make up for market losses when using a flash loan for rolling
/// @param lender ERC3156 flash lender used for rolling
/// @param fix If true, transfer one base wei to the pool to allow the Strategy to start enhanced TV pools
export const rollData: Array<[string, string, BigNumber, string, boolean]> = [
  [YSETH6MJD, FYETH2212, ZERO, ZERO_ADDRESS, true],
  [YSDAI6MJD, FYDAI2212, WAD.mul(10000), flashMintModule, true],
  [YSUSDC6MJD, FYUSDC2212, ZERO, ZERO_ADDRESS, true],
  [YSFRAX6MJD, FYFRAX2212, ZERO, ZERO_ADDRESS, false],
]
