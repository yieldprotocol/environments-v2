import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS } from '../../../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP } from '../../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, EODEC21, EOMAR22 } from '../../../../shared/constants'
import { YSDAI6MMS,YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const developer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const deployer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const assets: Map<number, Map<string, string>> = new Map([
  [1, new Map([
    [ETH,    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    [DAI,    '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
    [USDC,   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
    [WBTC,   '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
    [WSTETH, '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'],
    [STETH,  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
    [LINK,   '0x514910771af9ca656af840dff83e8264ecf986ca'],
    [ENS,    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
  ])],
  [4, new Map([
    [ETH,    '0x67c5279f044A40746017Ae1edD8bb7573273aA8b'],
    [DAI,    '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
    [USDC,   '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
    [WBTC,   '0x69A11AA0D394337570d84ce824a1ca6aFA0765DF'],
    [WSTETH, '0xf9F4D9e05503D416E95f05831A95ff43c3A01182'],
    [STETH,  '0xE910c4D4802898683De478e57852738e773dBCD9'],
    [LINK,   '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
    [ENS,    '0x5BeAdC789F094741DEaacd5a1499aEd7E9d7FB78'],
  ])],
  [42, new Map([
    [ETH,    '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
    [DAI,    '0xaFCdc724EB8781Ee721863db1B15939675996484'],
    [USDC,   '0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D'],
    [WBTC,   '0xD5FafCE68897bdb55fA11Dd77858Df7a9a458D92'],
    [WSTETH, '0x273325FeB84B5FBCD6ebdd5862FE2FCB0a02FE7C'],
    [STETH,  '0x7188e9DBdDf607474a44c653C693Aab99dB92a16'],
    [LINK,   '0xB62FCB2ef1d1819aED135F567859b080ddFe1008'],
    [ENS,    '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  ])],
])

export const chiSources: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
  [4, [
    [DAI,  '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
    [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
  ]],
  [42, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
])

export const rateSources: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
  [4, [
    [DAI,  '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
    [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
  ]],
  [42, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
])

export const chainlinkSources: Map<number, Array<[string, string, string, string, string]>> = new Map([
  [1, [
    [DAI,   (assets.get(1) as Map<string, string>).get(DAI)    as string, ETH, (assets.get(1) as Map<string, string>).get(ETH) as string, '0x773616E4d11A78F511299002da57A0a94577F1f4'],
    [USDC,  (assets.get(1) as Map<string, string>).get(USDC)   as string, ETH, (assets.get(1) as Map<string, string>).get(ETH) as string, '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'],
    [WBTC,  (assets.get(1) as Map<string, string>).get(WBTC)   as string, ETH, (assets.get(1) as Map<string, string>).get(ETH) as string, '0xdeb288F737066589598e9214E782fa5A8eD689e8'],
    [STETH, (assets.get(1) as Map<string, string>).get(STETH)  as string, ETH, (assets.get(1) as Map<string, string>).get(ETH) as string, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [LINK,  (assets.get(1) as Map<string, string>).get(LINK)   as string, ETH, (assets.get(1) as Map<string, string>).get(ETH) as string, '0xDC530D9457755926550b59e8ECcdaE7624181557'],
  ]],
  [4, [
    [DAI,   (assets.get(4) as Map<string, string>).get(DAI)   as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D'],
    [USDC,  (assets.get(4) as Map<string, string>).get(USDC)  as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0xdCA36F27cbC4E38aE16C4E9f99D39b42337F6dcf'],
    [WBTC,  (assets.get(4) as Map<string, string>).get(WBTC)  as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0x2431452A0010a43878bF198e170F6319Af6d27F4'],
    [STETH, (assets.get(4) as Map<string, string>).get(STETH) as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0x17AEAA7aF619Cf60095528cB115fbE22F14dFA44'],
    [LINK,  (assets.get(4) as Map<string, string>).get(LINK)  as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0xFABe80711F3ea886C3AC102c81ffC9825E16162E'],
    [ENS,   (assets.get(4) as Map<string, string>).get(ENS)   as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0x64EB137E967D1788Ce653C4Bdd4E4aD708F50Ae6'],
  ]],
  [42, [
    [DAI,   (assets.get(42) as Map<string, string>).get(DAI)   as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC,  (assets.get(42) as Map<string, string>).get(USDC)  as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC,  (assets.get(42) as Map<string, string>).get(WBTC)  as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [STETH, (assets.get(42) as Map<string, string>).get(STETH) as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [LINK,  (assets.get(42) as Map<string, string>).get(LINK)  as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38'],
    [ENS,   (assets.get(42) as Map<string, string>).get(ENS)   as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0x19d7cCdB7B4caE085d3Fda330A01D139d7243Be4'],
  ]],
])

// token0, token1, address, twapInterval
export const uniswapSources: Map<number, Array<[string, string, string, number]>> = new Map([
  [1, [
    [ETH, ENS,  '0x92560c178ce069cc014138ed3c2f5221ba71f58a', 600],
  ]],
  [4, []], // We don't use uniswap v2 in Rinkeby
  [42, []], // We don't use uniswap v2 in Kovan
])

// The lidoSource is the wstETH contract
export const lidoSource: Map<number, string> = new Map([
  [1,  (assets.get(1) as Map<string, string>).get(WSTETH) as string],
  [4,  (assets.get(4) as Map<string, string>).get(WSTETH) as string],
  [42, (assets.get(42) as Map<string, string>).get(WSTETH) as string],
])

export const compositeSources: Map<number, Array<[string, string, string]>> = new Map([
  [1, [
    [DAI,    ETH,   protocol.get(CHAINLINK) as string],
    [USDC,   ETH,   protocol.get(CHAINLINK) as string],
    [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
    [STETH,  ETH,   protocol.get(CHAINLINK) as string],
    [WSTETH, STETH, protocol.get(LIDO) as string],
    [ENS,    ETH,   protocol.get(UNISWAP) as string],
  ]],
  [4, [
    [DAI,    ETH,   protocol.get(CHAINLINK) as string],
    [USDC,   ETH,   protocol.get(CHAINLINK) as string],
    [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
    [STETH,  ETH,   protocol.get(CHAINLINK) as string],
    [WSTETH, STETH, protocol.get(LIDO) as string],
    [ENS,    ETH,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on rinkeby
  ]],
  [42, [
    [DAI,    ETH,   protocol.get(CHAINLINK) as string],
    [USDC,   ETH,   protocol.get(CHAINLINK) as string],
    [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
    [STETH,  ETH,   protocol.get(CHAINLINK) as string],
    [WSTETH, STETH, protocol.get(LIDO) as string],
    [ENS,    ETH,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on kovan
  ]],
])

export const compositePaths: Map<number, Array<[string, string, Array<string>]>> = new Map([
  [1, [
    [WSTETH, DAI, [STETH, ETH]],
    [WSTETH, USDC, [STETH, ETH]],
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]],
  [4, [
    [WSTETH, DAI, [STETH, ETH]],
    [WSTETH, USDC, [STETH, ETH]],
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]],
  [42, [
    [WSTETH, DAI, [STETH, ETH]],
    [WSTETH, USDC, [STETH, ETH]],
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]],
])

// Assets for which we will have a Join
export const assetsToAdd: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [ETH,    (assets.get(1) as Map<string, string>).get(ETH)    as string],
    [DAI,    (assets.get(1) as Map<string, string>).get(DAI)    as string],
    [USDC,   (assets.get(1) as Map<string, string>).get(USDC)   as string],
    [WBTC,   (assets.get(1) as Map<string, string>).get(WBTC)   as string],
    [WSTETH, (assets.get(1) as Map<string, string>).get(WSTETH) as string],
    [LINK,   (assets.get(1) as Map<string, string>).get(LINK) as string],
    [ENS,    (assets.get(1) as Map<string, string>).get(ENS)    as string],
  ]],
  [4, [
    [ETH,    (assets.get(4) as Map<string, string>).get(ETH)    as string],
    [DAI,    (assets.get(4) as Map<string, string>).get(DAI)    as string],
    [USDC,   (assets.get(4) as Map<string, string>).get(USDC)   as string],
    [WBTC,   (assets.get(4) as Map<string, string>).get(WBTC)   as string],
    [WSTETH, (assets.get(4) as Map<string, string>).get(WSTETH) as string],
    [LINK,   (assets.get(4) as Map<string, string>).get(LINK) as string],
    [ENS,    (assets.get(4) as Map<string, string>).get(ENS)    as string],
  ]],
  [42, [
    [ETH,    (assets.get(42) as Map<string, string>).get(ETH)    as string],
    [DAI,    (assets.get(42) as Map<string, string>).get(DAI)    as string],
    [USDC,   (assets.get(42) as Map<string, string>).get(USDC)   as string],
    [WBTC,   (assets.get(42) as Map<string, string>).get(WBTC)   as string],
    [WSTETH, (assets.get(42) as Map<string, string>).get(WSTETH) as string],
    [LINK,   (assets.get(42) as Map<string, string>).get(LINK) as string],
    [ENS,    (assets.get(42) as Map<string, string>).get(ENS)    as string],
  ]],
])

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [STETH, (assets.get(1) as Map<string, string>).get(STETH) as string],
  ]],
  [4, [
    [STETH, (assets.get(4) as Map<string, string>).get(STETH) as string],
  ]],
  [42, [
    [STETH, (assets.get(42) as Map<string, string>).get(STETH) as string],
  ]],
])

export const bases: Map<number, Array<string>> = new Map([
  [1, [DAI, USDC]],
  [4, [DAI, USDC]],
  [42, [DAI, USDC]],
])

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  ETH,  CHAINLINK, 1400000, 714000,  2000000,  5000, 18],
  [DAI,  DAI,  CHAINLINK, 1000000, 1000000, 10000000, 0,    18], // Constant 1, no dust
  [DAI,  USDC, CHAINLINK, 1330000, 751000,  100000,   5000, 18], // Via ETH
  [DAI,  WBTC, CHAINLINK, 1500000, 666000,  100000,   5000, 18], // Via ETH
  [DAI,  LINK, CHAINLINK, 1670000, 600000,  1000000,  5000, 18],
  [USDC, ETH,  CHAINLINK, 1400000, 714000,  5000000,  5000, 6],
  [USDC, DAI,  CHAINLINK, 1330000, 751000,  100000,   5000, 6], // Via ETH
  [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0,    6], // Constant 1, no dust
  [USDC, WBTC, CHAINLINK, 1500000, 666000,  100000,   5000, 6], // Via ETH  
  [USDC, LINK, CHAINLINK, 1670000, 600000,  1000000,  5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  WSTETH, COMPOSITE, 1400000, 714000, 500000,  5000, 18],
  [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000,  5000, 6],
  [DAI,  ENS,    COMPOSITE, 1670000, 600000, 2000000, 5000, 18],
  [USDC, ENS,    COMPOSITE, 1670000, 600000, 2000000, 5000, 6],
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
