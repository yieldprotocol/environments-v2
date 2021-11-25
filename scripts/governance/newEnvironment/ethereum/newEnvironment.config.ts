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

// TODO: Either nest maps here, or build an object
export const assets: Map<number, Array<[string, string]>> = new Map([
  [1, [
    [ETH,    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    [DAI,    '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
    [USDC,   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
    [WBTC,   '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
    [WSTETH, '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'],
    [STETH,  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
    [LINK,   ''],
    [ENS,    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
  ]],
  [42, [
    [ETH,    '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
    [DAI,    '0xaFCdc724EB8781Ee721863db1B15939675996484'],
    [USDC,   '0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D'],
    [WBTC,   '0xD5FafCE68897bdb55fA11Dd77858Df7a9a458D92'],
    [WSTETH, '0xB12C63eD91e901995E68023293AC1A308ffA6c3c'],
    [STETH,  '0x2296AB4F92f7fADC78eD02A9576B9a779CAa91bE'],
    [LINK,   '0xe37c6209C44d89c452A422DDF3B71D1538D58b96'],
    [ENS,    '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
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

// TODO: Make assets an object, and this sane
// assets.get(chainId)[ordinal of the asset][second position]
export const chainlinkSources: Map<number, Array<[string, string, string, string, string]>> = new Map([
  [1, [
    [DAI,   assets.get(1)[1][1], ETH, assets.get(1)[0][1], '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC,  assets.get(1)[2][1], ETH, assets.get(1)[0][1], '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC,  assets.get(1)[3][1], ETH, assets.get(1)[0][1], '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [STETH, assets.get(1)[5][1], ETH, assets.get(1)[0][1], '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
  ]],
  [42, [
    [DAI,   assets.get(42)[1][1], ETH, assets.get(42)[0][1], '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541'],
    [USDC,  assets.get(42)[2][1], ETH, assets.get(42)[0][1], '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838'],
    [WBTC,  assets.get(42)[3][1], ETH, assets.get(42)[0][1], '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [STETH, assets.get(42)[5][1], ETH, assets.get(42)[0][1], '0xF7904a295A029a3aBDFFB6F12755974a958C7C25'],
    [ENS,   assets.get(42)[6][1], ETH, assets.get(42)[0][1], '0x19d7cCdB7B4caE085d3Fda330A01D139d7243Be4'],
  ]],
])

// token0, token1, address, twapInterval
export const uniswapSources: Map<number, Array<[string, string, string, number]>> = new Map([
  [1, [
    [ETH, ENS,  '0x92560c178ce069cc014138ed3c2f5221ba71f58a', 600],
  ]],
])

// TODO: Make assets an object, and this sane
// assets.get(chainId)[ordinal of the asset][second position]
// The lidoSource is the wstETH contract
export const lidoSource: Map<number, string> = new Map([
  [1, assets.get(1)[4][1]],
  [42, assets.get(1)[4][1]],
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
