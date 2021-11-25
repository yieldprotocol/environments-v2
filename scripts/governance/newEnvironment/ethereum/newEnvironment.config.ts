import { stringToBytes6, bytesToString, readAddressMappingIfExists } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS } from '../../../../shared/constants'
import { CHAINLINK, COMPOUND, COMPOSITE, LIDO, UNISWAP } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const developer: Map<number, string> = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

export const deployer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
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
    [LINK,   ''],
    [ENS,    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
  ])],
  [42, new Map([
    [ETH,    '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
    [DAI,    '0xaFCdc724EB8781Ee721863db1B15939675996484'],
    [USDC,   '0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D'],
    [WBTC,   '0xD5FafCE68897bdb55fA11Dd77858Df7a9a458D92'],
    [WSTETH, '0xB12C63eD91e901995E68023293AC1A308ffA6c3c'],
    [STETH,  '0x2296AB4F92f7fADC78eD02A9576B9a779CAa91bE'],
    [LINK,   '0xe37c6209C44d89c452A422DDF3B71D1538D58b96'],
    [ENS,    '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  ])],
])

// Assets for which we will have a Join
export const assetsToAdd: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [ETH,    assets.get(1).get(ETH)],
    [DAI,    assets.get(1).get(DAI)],
    [USDC,   assets.get(1).get(USDC)],
    [WBTC,   assets.get(1).get(WBTC)],
    [WSTETH, assets.get(1).get(WSTETH)],
    [ENS,    assets.get(1).get(ENS)],
  ]],
  [42, [
    [ETH,    assets.get(1).get(ETH)],
    [DAI,    assets.get(1).get(DAI)],
    [USDC,   assets.get(1).get(USDC)],
    [WBTC,   assets.get(1).get(WBTC)],
    [WSTETH, assets.get(1).get(WSTETH)],
    [ENS,    assets.get(1).get(ENS)],
  ]],
])

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [STETH, assets.get(1).get(STETH)],
  ]],
  [42, [
    [STETH, assets.get(1).get(STETH)],
  ]],
])

export const bases: Map<number, Array<string>> = new Map([
  [1, [DAI, USDC]],
  [42, [DAI, USDC]],
])

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkIlks: Map<number, Array<[string, string, string, number, number, number, number, number]>> = new Map([
  [1, [
    [DAI, ETH, CHAINLINK, 1400000, 714000, 1000000, 1, 18],
    [DAI, DAI, CHAINLINK, 1000000, 1000000, 10000000, 0, 18], // Constant 1, no dust
    [DAI, USDC, CHAINLINK, 1330000, 751000, 100000, 1, 18], // Via ETH
    [DAI, WBTC, CHAINLINK, 1500000, 666000, 100000, 1, 18], // Via ETH
    [USDC, ETH, CHAINLINK, 1400000, 714000, 2000000, 1, 6],
    [USDC, DAI, CHAINLINK, 1330000, 751000, 100000, 1, 6], // Via ETH
    [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0, 6], // Constant 1, no dust
    [USDC, WBTC, CHAINLINK, 1500000, 666000, 100000, 1, 6], // Via ETH
  ]],
  [42, [
    [DAI, ETH, CHAINLINK, 1400000, 714000, 1000000, 1, 18],
    [DAI, DAI, CHAINLINK, 1000000, 1000000, 10000000, 0, 18], // Constant 1, no dust
    [DAI, USDC, CHAINLINK, 1330000, 751000, 100000, 1, 18], // Via ETH
    [DAI, WBTC, CHAINLINK, 1500000, 666000, 100000, 1, 18], // Via ETH
    [USDC, ETH, CHAINLINK, 1400000, 714000, 1000000, 1, 6],
    [USDC, DAI, CHAINLINK, 1330000, 751000, 100000, 1, 6], // Via ETH
    [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0, 6], // Constant 1, no dust
    [USDC, WBTC, CHAINLINK, 1500000, 666000, 100000, 1, 6], // Via ETH
  ]],
])

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeIlks: Map<number, Array<[string, string, string, number, number, number, number, number]>> = new Map([
  [1, [
    [DAI, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 18],
    [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 6],
    [DAI, ENS, COMPOSITE, 1670000, 600000, 500000, 100, 18],
    [USDC, ENS, COMPOSITE, 1670000, 600000, 500000, 100, 6],
  ]],
  [42, [
    [DAI, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 18],
    [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 6],
    [DAI, ENS, COMPOSITE, 1670000, 600000, 500000, 100, 18],
    [USDC, ENS, COMPOSITE, 1670000, 600000, 500000, 100, 6],
  ]],
])

export const chiSources: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
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
  [42, [
    [DAI,  '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'],
    [USDC, '0x4a92e71227d294f041bd82dd8f78591b75140d63'],
  ]],
])

export const chainlinkSources: Map<number, Array<[string, string, string, string, string]>> = new Map([
  [1, [
    [DAI,   assets.get(1).get(DAI),   ETH, assets.get(1).get(ETH), '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC,  assets.get(1).get(USDC),  ETH, assets.get(1).get(ETH), '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC,  assets.get(1).get(WBTC),  ETH, assets.get(1).get(ETH), '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [STETH, assets.get(1).get(STETH), ETH, assets.get(1).get(ETH), '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  ]],
  [42, [
    [DAI,   assets.get(42).get(DAI),   ETH, assets.get(42).get(ETH), '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC,  assets.get(42).get(USDC),  ETH, assets.get(42).get(ETH), '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC,  assets.get(42).get(WBTC),  ETH, assets.get(42).get(ETH), '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [STETH, assets.get(42).get(STETH), ETH, assets.get(42).get(ETH), '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [ENS,   assets.get(42).get(ENS),   ETH, assets.get(42).get(ETH), '0x19d7cCdB7B4caE085d3Fda330A01D139d7243Be4'],
  ]],
])

// token0, token1, address, twapInterval
export const uniswapSources: Map<number, Array<[string, string, string, number]>> = new Map([
  [1, [
    [ETH, ENS,  '0x92560c178ce069cc014138ed3c2f5221ba71f58a', 600],
  ]],
])

// The lidoSource is the wstETH contract
export const lidoSource: Map<number, string> = new Map([
  [1, assets.get(1).get(WSTETH)],
  [42, assets.get(1).get(WSTETH)],
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
  [42, [
    [WSTETH, DAI, [STETH, ETH]],
    [WSTETH, USDC, [STETH, ETH]],
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]],
])
