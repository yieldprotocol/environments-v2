import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI } from '../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP } from '../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, EODEC21, EOMAR22 } from '../../shared/constants'
import { YSDAI6MMS,YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');
export const chainId = 42
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'

export const assets: Map<string, string> = new Map([
  [ETH,    '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
  [DAI,    '0xaFCdc724EB8781Ee721863db1B15939675996484'],
  [USDC,   '0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D'],
  [WBTC,   '0xD5FafCE68897bdb55fA11Dd77858Df7a9a458D92'],
  [WSTETH, '0x273325FeB84B5FBCD6ebdd5862FE2FCB0a02FE7C'],
  [STETH,  '0x7188e9DBdDf607474a44c653C693Aab99dB92a16'],
  [LINK,   '0xB62FCB2ef1d1819aED135F567859b080ddFe1008'],
  [ENS,    '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  [UNI,    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
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
  [DAI,   assets.get(DAI)   as string, ETH, assets.get(ETH) as string, '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
  [USDC,  assets.get(USDC)  as string, ETH, assets.get(ETH) as string, '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
  [WBTC,  assets.get(WBTC)  as string, ETH, assets.get(ETH) as string, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  [LINK,  assets.get(LINK)  as string, ETH, assets.get(ETH) as string, '0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38'],
  [ENS,   assets.get(ENS)   as string, ETH, assets.get(ETH) as string, '0x19d7cCdB7B4caE085d3Fda330A01D139d7243Be4'],
  [UNI,   assets.get(UNI)   as string, ETH, assets.get(ETH) as string, '0xC0E69E49D98D26D52f7505Af1dF8b3009168f945'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Kovan

// The lidoSource is the wstETH contract
export const lidoSource: string = assets.get(WSTETH) as string

export const compositeSources: Array<[string, string, string]> = [
  [DAI,    ETH,   protocol.get(CHAINLINK) as string],
  [USDC,   ETH,   protocol.get(CHAINLINK) as string],
  [WBTC,   ETH,   protocol.get(CHAINLINK) as string],
  [STETH,  ETH,   protocol.get(CHAINLINK) as string],
  [WSTETH, STETH, protocol.get(LIDO) as string],
  [ENS,    ETH,   protocol.get(CHAINLINK) as string], // We don't use Uniswap on kovan
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
  [LINK,   assets.get(LINK)   as string],
  [ENS,    assets.get(ENS)    as string],
  [UNI,    assets.get(UNI)    as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [
  [STETH, assets.get(STETH) as string],
]

export const bases: Array<string> = [DAI, USDC]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  ETH,  CHAINLINK, 1400000, 714000,  2000000,  5000, 18],
  [DAI,  DAI,  CHAINLINK, 1000000, 1000000, 10000000, 0,    18], // Constant 1, no dust
  [DAI,  USDC, CHAINLINK, 1330000, 751000,  100000,   5000, 18], // Via ETH
  [DAI,  WBTC, CHAINLINK, 1500000, 666000,  100000,   5000, 18], // Via ETH
  [DAI,  LINK, CHAINLINK, 1670000, 600000,  1000000,  5000, 18],
  [DAI,  UNI,  CHAINLINK, 1670000, 600000,  1000000,  5000, 18],
  [USDC, ETH,  CHAINLINK, 1400000, 714000,  5000000,  5000, 6],
  [USDC, DAI,  CHAINLINK, 1330000, 751000,  100000,   5000, 6], // Via ETH
  [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0,    6], // Constant 1, no dust
  [USDC, WBTC, CHAINLINK, 1500000, 666000,  100000,   5000, 6], // Via ETH  
  [USDC, LINK, CHAINLINK, 1670000, 600000,  1000000,  5000, 6],
  [USDC, UNI,  CHAINLINK, 1670000, 600000,  1000000,  5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  WSTETH, COMPOSITE, 1400000, 714000, 500000,  5000, 18],
  [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000,  5000, 6],
  [DAI,  ENS,    COMPOSITE, 1670000, 600000, 2000000, 5000, 18],
  [USDC, ENS,    COMPOSITE, 1670000, 600000, 2000000, 5000, 6],
]