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
  YIELDMATH,
  LADLE,
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
export const fyTokens: Map<string, string> = base_config.fyTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies
export const eulerAddress = base_config.eulerAddress
export const flashMintModule = '0x1EB4CF3A948E7D72A198fe073cCb8C7a948cD853'

import { AuctionLineAndLimit, ContractDeployment } from '../../../confTypes'

// Time stretch to be set in the PoolFactory prior to pool deployment
export const timeStretch: Map<string, BigNumber> = new Map([[FYFRAX2212, ONE64.div(secondsInOneYear.mul(20))]])

// Sell base to the pool fee, as fp4
export const g1: number = 9000

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: YIELDMATH,
    contract: 'YieldMath',
    args: [],
  },
  {
    addressFile: 'pools.json',
    name: FYFRAX2212,
    contract: 'PoolNonTv',
    args: [assets.get(FRAX)!, fyTokens.get(FYFRAX2212)!, timeStretch.get(FYFRAX2212)!.toString(), g1.toString()],
    libs: {
      YieldMath: protocol.get('yieldMath')!,
    },
  },
  {
    addressFile: 'strategies.json',
    name: YSFRAX6MJD,
    contract: 'Strategy',
    args: [
      'Yield Strategy FRAX 6M Jun Dec',
      YSFRAX6MJD,
      protocol.get(LADLE)!,
      assets.get(FRAX)!,
      FRAX,
      joins.get(FRAX)!,
    ],
    libs: {
      SafeERC20Namer: protocol.get('safeERC20Namer')!,
    },
  },
]

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
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
export const nonTVPoolData: Array<[string, string, string, BigNumber, number]> = [
  [
    FYFRAX2212,
    assets.get(FRAX) as string,
    fyTokens.get(FYFRAX2212) as string,
    timeStretch.get(FYFRAX2212) as BigNumber,
    g1,
  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYFRAX2212, FRAX, WAD.mul(100), BigNumber.from('0')],
]

// // Ilks to accept for each series
// // seriesId, accepted ilks
// export const seriesIlks: Array<[string, string[]]> = [
//   [FYETH2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
//   [FYDAI2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
//   [FYUSDC2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC]],
//   [FYFRAX2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
// ]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy FRAX 6M Jun Dec', YSFRAX6MJD, FRAX],
]

// Input data
export const strategiesInit: Array<[string, string, string, BigNumber]> = [
  // [strategyId, startPoolAddress, startPoolId, initAmount]
  [YSFRAX6MJD, newPools.get(FYFRAX2212) as string, FYFRAX2212, WAD.mul(100)],
]
