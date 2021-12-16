import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI, WAD, ONEUSDC, MAX256, ONE64 } from '../../../../shared/constants'
import { EOJUN22, FYDAI2206, FYUSDC2206, YSDAI6MJD, YSUSDC6MJD, COMPOUND } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

// When deploying the pools, the fyToken should be present already
const fyTokens = readAddressMappingIfExists('newFYTokens.json');

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whale = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const assets: Map<string, string> = new Map([
  [ETH,    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
  [DAI,    '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
  [USDC,   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  [WBTC,   '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
  [WSTETH, '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'],
  [STETH,  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
  [LINK,   '0x514910771af9ca656af840dff83e8264ecf986ca'],
  [ENS,    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
  [UNI,    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
])

// assetId, joinAddress
export const joins: Map<string, string> = new Map([
  [DAI,    '0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc'],
  [USDC,   '0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4'],
])

// seriesId, fyTokenAddress
export const poolData: Array<[string, string]> = [
  [FYDAI2206,  fyTokens.get(FYDAI2206) as string],
  [FYUSDC2206, fyTokens.get(FYUSDC2206) as string]
]

// seriesId, initAmount
export const poolsInit: Array<[string, BigNumber, BigNumber]> = [
  [FYDAI2206,  WAD.mul(100),  WAD.mul(32)],
  [FYUSDC2206, ONEUSDC.mul(100), ONEUSDC.mul(48)],
]

// g1, g2
export const poolFees: [BigNumber, BigNumber] = [
  ONE64.mul(75).div(100), // Sell base to the pool
  ONE64.mul(100).div(75), // Sell fyToken to the pool
] 

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2206,  DAI,  protocol.get(COMPOUND) as string, joins.get(DAI) as string,  EOJUN22, 'FYDAI2206',  'FYDAI2206'],
  [FYUSDC2206, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EOJUN22, 'FYUSDC2206', 'FYUSDC2206'],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2206,  [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
]

// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  [YSDAI6MJD,  FYDAI2206,  BigNumber.from(0), MAX256],
  [YSUSDC6MJD, FYUSDC2206, BigNumber.from(0), MAX256],
]


