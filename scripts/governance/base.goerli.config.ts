import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI, YVUSDC, FRAX, ACCUMULATOR } from '../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO } from '../../shared/constants'

export const chainId = 42
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const joins = readAddressMappingIfExists('joins.json')
export const pools = readAddressMappingIfExists('pools.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const newJoins = readAddressMappingIfExists('newJoins.json')
export const newFYTokens = readAddressMappingIfExists('newFYTokens.json')
export const newPools = readAddressMappingIfExists('newPools.json')
export const newStrategies = readAddressMappingIfExists('newStrategies.json')

export const whales: Map<string, string> = new Map([
  [ETH, developer],
  [DAI, developer],
  [USDC, developer],
  [WBTC, developer],
  [WSTETH, developer],
  [STETH, developer],
  [LINK, developer],
  [ENS, developer],
  [UNI, developer],
  [YVUSDC, developer],
  [FRAX, developer],
])

export const assets: Map<string, string> = new Map([
  [ETH, protocol.get('wethMock') as string],
  [DAI, protocol.get('daiMock') as string],
  [USDC, protocol.get('usdcMock') as string],
  [WBTC, protocol.get('wbtcMock') as string],
  [WSTETH, protocol.get('wstETHMock') as string],
  [STETH, protocol.get('stETHMock') as string],
  [LINK, protocol.get('linkMock') as string],
  [ENS, protocol.get('ensMock') as string],
  [UNI, protocol.get('uniMock') as string],
  [YVUSDC, protocol.get('yvUSDCMock') as string],
  [FRAX, protocol.get('fraxMock') as string],
])

export const chiSources: Array<[string, string]> = [
  [DAI, '0x822397d9a55d0fefd20f5c4bcab33c5f65bd28eb'],
  [USDC, '0xcec4a43ebb02f9b80916f1c718338169d6d5c1f0'],
  [ETH, '0x20572e4c090f15667cf7378e16fad2ea0e2f3eff'],
  [FRAX, protocol.get(ACCUMULATOR) as string],
]

export const rateSources: Array<[string, string]> = [
  [DAI, '0x822397d9a55d0fefd20f5c4bcab33c5f65bd28eb'],
  [USDC, '0xcec4a43ebb02f9b80916f1c718338169d6d5c1f0'],
  [ETH, '0x20572e4c090f15667cf7378e16fad2ea0e2f3eff'],
  [FRAX, protocol.get(ACCUMULATOR) as string],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI, assets.get(DAI) as string, ETH, assets.get(ETH) as string, protocol.get(DAI + 'Mock') as string],
  [USDC, assets.get(USDC) as string, ETH, assets.get(ETH) as string, protocol.get(USDC + 'Mock') as string],
  [WBTC, assets.get(WBTC) as string, ETH, assets.get(ETH) as string, protocol.get(WBTC + 'Mock') as string],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, protocol.get(STETH + 'Mock') as string],
  [LINK, assets.get(LINK) as string, ETH, assets.get(ETH) as string, protocol.get(LINK + 'Mock') as string],
  [ENS, assets.get(ENS) as string, ETH, assets.get(ETH) as string, protocol.get(ENS + 'Mock') as string],
  [UNI, assets.get(UNI) as string, ETH, assets.get(ETH) as string, protocol.get(UNI + 'Mock') as string],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Kovan

// The lidoSource is the wstETH contract
export const lidoSource: string = assets.get(WSTETH) as string

export const compositeSources: Array<[string, string, string]> = [
  [DAI, ETH, protocol.get(CHAINLINK) as string],
  [USDC, ETH, protocol.get(CHAINLINK) as string],
  [WBTC, ETH, protocol.get(CHAINLINK) as string],
  [STETH, ETH, protocol.get(CHAINLINK) as string],
  [WSTETH, STETH, protocol.get(LIDO) as string],
  [ENS, ETH, protocol.get(CHAINLINK) as string], // We don't use Uniswap on goerli
  [FRAX, ETH, protocol.get(CHAINLINK) as string],
  [UNI, ETH, protocol.get(CHAINLINK) as string],
  [LINK, ETH, protocol.get(CHAINLINK) as string],
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
  [ENS, DAI, [ETH]],
  [ENS, USDC, [ETH]],
  [FRAX, ENS, [ETH]],
  [FRAX, WSTETH, [ETH, STETH]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH, assets.get(ETH) as string],
  [DAI, assets.get(DAI) as string],
  [USDC, assets.get(USDC) as string],
  [WBTC, assets.get(WBTC) as string],
  [WSTETH, assets.get(WSTETH) as string],
  [LINK, assets.get(LINK) as string],
  [ENS, assets.get(ENS) as string],
  [UNI, assets.get(UNI) as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [[STETH, assets.get(STETH) as string]]

export const bases: Array<string> = [DAI, USDC, FRAX]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI, ETH, CHAINLINK, 1400000, 714000, 2000000, 5000, 18],
  [DAI, DAI, CHAINLINK, 1000000, 1000000, 10000000, 0, 18], // Constant 1, no dust
  [DAI, USDC, CHAINLINK, 1330000, 751000, 100000, 5000, 18], // Via ETH
  [DAI, WBTC, CHAINLINK, 1500000, 666000, 100000, 5000, 18], // Via ETH
  [DAI, LINK, CHAINLINK, 1670000, 600000, 1000000, 5000, 18],
  [DAI, UNI, CHAINLINK, 1670000, 600000, 1000000, 5000, 18],
  [USDC, ETH, CHAINLINK, 1400000, 714000, 5000000, 5000, 6],
  [USDC, DAI, CHAINLINK, 1330000, 751000, 100000, 5000, 6], // Via ETH
  [USDC, USDC, CHAINLINK, 1000000, 1000000, 10000000, 0, 6], // Constant 1, no dust
  [USDC, WBTC, CHAINLINK, 1500000, 666000, 100000, 5000, 6], // Via ETH
  [USDC, LINK, CHAINLINK, 1670000, 600000, 1000000, 5000, 6],
  [USDC, UNI, CHAINLINK, 1670000, 600000, 1000000, 5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI, WSTETH, COMPOSITE, 1400000, 714000, 500000, 5000, 18],
  [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000, 5000, 6],
  [DAI, ENS, COMPOSITE, 1670000, 600000, 2000000, 5000, 18],
  [USDC, ENS, COMPOSITE, 1670000, 600000, 2000000, 5000, 6],
]
