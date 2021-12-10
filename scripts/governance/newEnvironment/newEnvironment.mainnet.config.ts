import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS } from '../../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP } from '../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, EODEC21, EOMAR22 } from '../../../shared/constants'
import { YSDAI6MMS,YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const chainId = 1
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const assets: Map<string, string> = new Map([
  [ETH,    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
  [DAI,    '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
  [USDC,   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  [WBTC,   '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
  [WSTETH, '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'],
  [STETH,  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
  [LINK,   '0x514910771af9ca656af840dff83e8264ecf986ca'],
  [ENS,    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
])

export const chiSources: Array<[string, string]> = [
  [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
  [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
]

export const rateSources: Array<[string, string]> = [
  [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
  [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI,   assets.get(DAI)    as string, ETH, assets.get(ETH) as string, '0x773616E4d11A78F511299002da57A0a94577F1f4'],
  [USDC,  assets.get(USDC)   as string, ETH, assets.get(ETH) as string, '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'],
  [WBTC,  assets.get(WBTC)   as string, ETH, assets.get(ETH) as string, '0xdeb288F737066589598e9214E782fa5A8eD689e8'],
  [STETH, assets.get(STETH)  as string, ETH, assets.get(ETH) as string, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  [LINK,  assets.get(LINK)   as string, ETH, assets.get(ETH) as string, '0xDC530D9457755926550b59e8ECcdaE7624181557'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [
  [ETH, ENS,  '0x92560c178ce069cc014138ed3c2f5221ba71f58a', 600],
]

// The lidoSource is the wstETH contract
export const lidoSource: string = assets.get(WSTETH) as string

export const compositeSources: Array<[string, string, string]> = [
  [DAI,    ETH,   protocol.get(CHAINLINK) as string],
  [USDC,   ETH,   protocol.get(CHAINLINK) as string],
  [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
  [STETH,  ETH,   protocol.get(CHAINLINK) as string],
  [WSTETH, STETH, protocol.get(LIDO) as string],
  [ENS,    ETH,   protocol.get(UNISWAP) as string],
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
  [ENS, DAI, [ETH]],
  [ENS, USDC, [ETH]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH,    assets.get(ETH)    as string],
  [DAI,    assets.get(DAI)    as string],
  [USDC,   assets.get(USDC)   as string],
  [WBTC,   assets.get(WBTC)   as string],
  [WSTETH, assets.get(WSTETH) as string],
  [LINK,   assets.get(LINK) as string],
  [ENS,    assets.get(ENS)    as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [
  [STETH, assets.get(STETH) as string],
]

export const bases: Array<string> = [DAI, USDC]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  ETH,  CHAINLINK, 1400000, 714000,  1000000,  1,   18],
  [DAI,  DAI,  CHAINLINK, 1000000, 1000000, 10000000, 0,   18], // Constant 1, no dust
  [DAI,  USDC, CHAINLINK, 1330000, 751000,  100000,   1,   18], // Via ETH
  [DAI,  WBTC, CHAINLINK, 1500000, 666000,  100000,   1,   18], // Via ETH
  [DAI,  LINK, CHAINLINK, 1670000, 1000000, 1000000,  100, 18],
  [USDC, ETH,  CHAINLINK, 1400000, 714000,  5000000,  1,   6],
  [USDC, DAI,  CHAINLINK, 1330000, 751000,  100000,   1,   6], // Via ETH
  [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0,   6], // Constant 1, no dust
  [USDC, WBTC, CHAINLINK, 1500000, 666000,  100000,   1,   6], // Via ETH  
  [USDC, LINK, CHAINLINK, 1670000, 1000000, 1000000,  100, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  WSTETH, COMPOSITE, 1400000, 714000, 500000,  1,   18],
  [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000,  1,   6],
  [DAI,  ENS,    COMPOSITE, 1670000, 600000, 500000,  100, 18],
  [USDC, ENS,    COMPOSITE, 1670000, 600000, 1000000, 100, 6],
]

// Input data: seriesId, baseId, maturity, [ilkIds], symbol, name
export const seriesDAI: Array<[string, string, number, string[], string, string]> = [
  [FYDAI2112,  DAI,  EODEC21, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS], 'FYDAI2112',  'FYDAI2112'],
  [FYDAI2203,  DAI,  EOMAR22, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS], 'FYDAI2203',  'FYDAI2203'],
]

// Input data: seriesId, baseId, maturity, [ilkIds], symbol, name
export const seriesUSDC: Array<[string, string, number, string[], string, string]> = [
  [FYUSDC2112, USDC, EODEC21, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS], 'FYUSDC2112', 'FYUSDC2112'],
  [FYUSDC2203, USDC, EOMAR22, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS], 'FYUSDC2203', 'FYUSDC2203'],
]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy DAI 6M Mar Sep',  YSDAI6MMS,  DAI],
  ['Yield Strategy DAI 6M Jun Dec',  YSDAI6MJD,  DAI],
  ['Yield Strategy USDC 6M Mar Sep', YSUSDC6MMS, USDC],
  ['Yield Strategy USDC 6M Jun Dec', YSUSDC6MJD, USDC],
]

// Input data
export const strategiesInit: Array<[string, string, BigNumber]> = [
  // [strategyId, startPoolId, initAmount]
  [YSDAI6MMS,  FYDAI2203,  WAD.mul(100)],
  [YSDAI6MJD,  FYDAI2112,  WAD.mul(100)],
  [YSUSDC6MMS, FYUSDC2203, ONEUSDC.mul(100)],
  [YSUSDC6MJD, FYUSDC2112, ONEUSDC.mul(100)],
]

export const poolsInit: Array<[string, BigNumber]> = [
  // poolId, initAmount
  [FYDAI2203,  WAD.mul(100)],
  [FYDAI2112,  WAD.mul(100)],
  [FYUSDC2203, ONEUSDC.mul(100)],
  [FYUSDC2112, ONEUSDC.mul(100)],
]
