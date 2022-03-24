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
  secondsIn25Years,
  ACCUMULATOR,
} from '../../../../shared/constants'
import { EOSEPT22, FYDAI2209, FYUSDC2209, YSDAI6MMS, YSUSDC6MMS, COMPOUND } from '../../../../shared/constants'

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
export const assets: Map<string, string> = new Map([
  [ETH, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  [DAI, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'],
  [USDC, '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'],
])

// Joins deployed, used in fyTokenData below
// assetId, joinAddress
export const joins: Map<string, string> = new Map([
  [DAI, '0xc31cce4fFA203d8F8D865b6cfaa4F36AD77E9810'],
  [USDC, '0x1229C71482E458fa2cd51d13eB157Bd2b5D5d1Ee'],
])

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2209, DAI, protocol.get(ACCUMULATOR) as string, joins.get(DAI) as string, EOSEPT22, 'FYDAI2209', 'FYDAI2209'],
  [
    FYUSDC2209,
    USDC,
    protocol.get(ACCUMULATOR) as string,
    joins.get(USDC) as string,
    EOSEPT22,
    'FYUSDC2209',
    'FYUSDC2209',
  ],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYDAI2209,
    assets.get(DAI) as string,
    fyTokens.get(FYDAI2209) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYUSDC2209,
    assets.get(USDC) as string,
    fyTokens.get(FYUSDC2209) as string,
    ONE64.div(secondsIn25Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, baseId, baseAmount, fyTokenAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYDAI2209, DAI, WAD.mul(100), BigNumber.from(0)],
  [FYUSDC2209, USDC, ONEUSDC.mul(100), BigNumber.from(0)],
]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [ETH, DAI, USDC]],
  [FYUSDC2209, [ETH, DAI, USDC]],
]

// Parameters to roll each strategy
// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MMS, FYDAI2209, BigNumber.from(0), MAX256],
  [YSUSDC6MMS, FYUSDC2209, BigNumber.from(0), MAX256],
]
