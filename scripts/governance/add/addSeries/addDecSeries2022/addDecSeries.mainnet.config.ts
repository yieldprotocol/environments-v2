import { BigNumber } from 'ethers'
import * as base_config from '../../../base.mainnet.config'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  STETH,
  LINK,
  ENS,
  UNI,
  YVUSDC,
  WAD,
  ONEUSDC,
  MAX256,
  ONE64,
  secondsIn30Years,
} from '../../../../../shared/constants'
import { EODEC22, FYDAI2212, FYUSDC2212, YSDAI6MJD, YSUSDC6MJD, COMPOUND } from '../../../../../shared/constants'
export const protocol = base_config.protocol
export const governance = base_config.governance

// When deploying the pools, the fyToken should be present already
const fyTokens = readAddressMappingIfExists('newFYTokens.json')

// Account to impersonate when using forks
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Account used to deploy permissioned contracts
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Accounts with sizable amounts of given assets, for testing on forks
export const whales: Map<string, string> = new Map([
  [ETH, '0x2feb1512183545f48f6b9c5b4ebfcaf49cfca6f3'],
  [DAI, '0x9a315bdf513367c0377fb36545857d12e85813ef'],
  [USDC, '0x5aa653a076c1dbb47cec8c1b4d152444cad91941'],
  [WBTC, '0xb60c61dbb7456f024f9338c739b02be68e3f545c'],
  [WSTETH, '0x3991adbdf461d6817734555efdc8ef056fefbf21'],
  [STETH, '0x06920c9fc643de77b99cb7670a944ad31eaaa260'],
  [LINK, '0x0d4f1ff895d12c34994d6b65fabbeefdc1a9fb39'],
  [ENS, '0x5a52e96bacdabb82fd05763e25335261b270efcb'],
  [UNI, '0x47173b170c64d16393a52e6c480b3ad8c302ba1e'],
])

// Tokens known to the protocol
export const assets: Map<string, string> = new Map([
  [ETH, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
  [DAI, '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
  [USDC, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  [WBTC, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
  [WSTETH, '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'],
  [STETH, '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
  [LINK, '0x514910771af9ca656af840dff83e8264ecf986ca'],
  [ENS, '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
  [UNI, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
])

// Joins deployed, used in fyTokenData below
// assetId, joinAddress
export const joins: Map<string, string> = new Map([
  [DAI, '0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc'],
  [USDC, '0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4'],
])

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2212, DAI, protocol.get(COMPOUND) as string, joins.get(DAI) as string, EODEC22, 'FYDAI2212', 'FYDAI2212'],
  [FYUSDC2212, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EODEC22, 'FYUSDC2212', 'FYUSDC2212'],
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
  [FYDAI2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC]],
]

// Parameters to roll each strategy
// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MJD, FYDAI2212, BigNumber.from(0), MAX256],
  [YSUSDC6MJD, FYUSDC2212, BigNumber.from(0), MAX256],
]
