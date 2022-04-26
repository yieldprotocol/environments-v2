import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import {
  ETH,
  DAI,
  USDC,
  WAD,
  ONEUSDC,
  MAX256,
  ONE64,
  secondsIn30Years,
  ACCUMULATOR,
} from '../../../../shared/constants'
import { EODEC22, FYDAI2212, FYUSDC2212, YSDAI6MMS, YSUSDC6MMS, COMPOUND } from '../../../../shared/constants'
import { assets as arbAssets, joins as arbJoins } from '../../base.arb_mainnet.config'

const protocol = readAddressMappingIfExists('protocol.json')

// When deploying the pools, the fyToken should be present already
const fyTokens = readAddressMappingIfExists('newFYTokens.json')

// Account to impersonate when using forks
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Account used to deploy permissioned contracts
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Accounts with sizable amounts of given assets, for testing on forks
export const whales: Map<string, string> = new Map([
  [DAI, '0xa5a33ab9063395a90ccbea2d86a62eccf27b5742'],
  [USDC, '0xba12222222228d8ba445958a75a0704d566bf2c8'],
])

// Tokens known to the protocol
// https://tokenlists.org/token-list?url=https://bridge.arbitrum.io/token-list-42161.json
export const assets: Map<string, string> = arbAssets

// Joins deployed, used in fyTokenData below
// assetId, joinAddress
export const joins: Map<string, string> = arbJoins

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2212, DAI, protocol.get(ACCUMULATOR) as string, joins.get(DAI) as string, EODEC22, 'FYDAI2212', 'FYDAI2212'],
  [
    FYUSDC2212,
    USDC,
    protocol.get(ACCUMULATOR) as string,
    joins.get(USDC) as string,
    EODEC22,
    'FYUSDC2212',
    'FYUSDC2212',
  ],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYDAI2212,
    assets.get(DAI) as string,
    fyTokens.get(FYDAI2212) as string,
    ONE64.div(secondsIn30Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYUSDC2212,
    assets.get(USDC) as string,
    fyTokens.get(FYUSDC2212) as string,
    ONE64.div(secondsIn30Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, baseId, baseAmount, fyTokenAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYDAI2212, DAI, WAD.mul(100), BigNumber.from(0)],
  [FYUSDC2212, USDC, ONEUSDC.mul(100), BigNumber.from(0)],
]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2212, [ETH, DAI, USDC]],
  [FYUSDC2212, [ETH, DAI, USDC]],
]

// Parameters to roll each strategy
// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MMS, FYDAI2212, BigNumber.from(0), MAX256],
  [YSUSDC6MMS, FYUSDC2212, BigNumber.from(0), MAX256],
]
