import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI, YVUSDC } from '../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP } from '../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, EODEC21, EOMAR22 } from '../../shared/constants'
import { YSDAI6MMS, YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../shared/constants'

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
  [ETH, ''],
  [DAI, '0x20918f71e99c09ae2ac3e33dbde33457d3be01f4'],
  [USDC, '0x75c0c372da875a4fc78e8a37f58618a6d18904e8'],
  [WBTC, '0xc6b4e749605a10d3434bc85a797062fad3dee280'],
  [WSTETH, '0x62a3d8a878beef2ba024bbc26c5be9d2ee4dde7e'],
  [STETH, '0x06f405e5a760b8cde3a48f96105659cedf62da63'],
  [LINK, '0xe4ddb4233513498b5aa79b98bea473b01b101a67'],
  [ENS, ''],
  [YVUSDC, ''],
  [UNI, '0x5f98ee67c319880b925d83400b26ba4188c5523f'],
])

export const assets: Map<string, string> = new Map([
  [ETH, ''],
  [DAI, '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844'],
  [USDC, '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'],
  [WBTC, '0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05'],
  [WSTETH, '0x6320cD32aA674d2898A68ec82e869385Fc5f7E2f'],
  [STETH, '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F'],
  [LINK, '0x326c977e6efc84e512bb9c30f76e30c160ed06fb'],
  [ENS, ''],
  [UNI, '0x6be1a99c215872cea33217b0f4bad63f186ddfac'],
])

export const chiSources: Array<[string, string]> = [
  [DAI, '0x822397d9a55d0fefd20f5c4bcab33c5f65bd28eb'],
  [USDC, '0xcec4a43ebb02f9b80916f1c718338169d6d5c1f0'],
  [ETH, '0x20572e4c090f15667cf7378e16fad2ea0e2f3eff'],
]

export const rateSources: Array<[string, string]> = [
  [DAI, '0x822397d9a55d0fefd20f5c4bcab33c5f65bd28eb'],
  [USDC, '0xcec4a43ebb02f9b80916f1c718338169d6d5c1f0'],
  [ETH, '0x20572e4c090f15667cf7378e16fad2ea0e2f3eff'],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI, assets.get(DAI) as string, ETH, assets.get(ETH) as string, ''],
  [USDC, assets.get(USDC) as string, ETH, assets.get(ETH) as string, ''],
  [WBTC, assets.get(WBTC) as string, ETH, assets.get(ETH) as string, ''],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, ''],
  [LINK, assets.get(LINK) as string, ETH, assets.get(ETH) as string, ''],
  [ENS, assets.get(ENS) as string, ETH, assets.get(ETH) as string, ''],
  [UNI, assets.get(UNI) as string, ETH, assets.get(ETH) as string, ''],
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
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
  [ENS, DAI, [ETH]],
  [ENS, USDC, [ETH]],
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

export const bases: Array<string> = [DAI, USDC]

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
