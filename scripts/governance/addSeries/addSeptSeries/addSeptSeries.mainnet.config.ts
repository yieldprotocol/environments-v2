import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
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
  secondsIn25Years,
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
  [ETH, '0x2feb1512183545f48f6b9c5b4ebfcaf49cfca6f3'],
  [DAI, '0x9a315bdf513367c0377fb36545857d12e85813ef'],
  [USDC, '0x5aa653a076c1dbb47cec8c1b4d152444cad91941'],
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
  [FYDAI2209, DAI, protocol.get(COMPOUND) as string, joins.get(DAI) as string, EOSEPT22, 'FYDAI2209', 'FYDAI2209'],
  [FYUSDC2209, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EOSEPT22, 'FYUSDC2209', 'FYUSDC2209'],
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
// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYDAI2209, DAI, WAD.mul(100), WAD.mul(39)], // The March series has a 100 / 139 ratio of base to fyToken. Virtual fyToken reserves will be 100 after init.
  [FYUSDC2209, USDC, ONEUSDC.mul(100), ONEUSDC.mul(24)], // The March series has a 100 / 124 ratio of base to fyToken. Virtual fyToken reserves will be 100 after init.
]

// Pool fees to be set in the PoolFactory prior to pool deployment
// g1, g2
export const poolFees: [BigNumber, BigNumber] = [
  ONE64.mul(75).div(100), // Sell base to the pool
  ONE64.mul(100).div(75), // Sell fyToken to the pool
]

// Time stretch to be set in the PoolFactory prior to pool deployment
export const timeStretch: BigNumber = ONE64.div(secondsIn25Years)

// Amount to loan to the Joins in forks. On mainnet, someone will need to deposit into a vault
// assetId, loanAmount
export const joinLoans: Array<[string, BigNumber]> = [
  [DAI, WAD.mul(10000)], // Join(0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc) has 751342576505567524055158 DAI, pool(0x2e4B70D0F020E62885E82bf75bc123e1Aa8c79cA) has 28060258605059358888379 fyDAI. Surplus is 723282317900508165166779 DAI
  [USDC, ONEUSDC.mul(10000)], // Join(0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4) has 2627478782835 USDC, pool(0x80142add3A597b1eD1DE392A56B2cef3d8302797) has 82547487593 fyUSDC. Surplus is 235316 817437 USDC.
]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC]],
]

// Parameters to roll each strategy
// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MMS, FYDAI2209, BigNumber.from(0), MAX256],
  [YSUSDC6MMS, FYUSDC2209, BigNumber.from(0), MAX256],
]
