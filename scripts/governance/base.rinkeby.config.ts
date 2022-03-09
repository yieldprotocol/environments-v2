import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, UNI, YVUSDC } from '../../shared/constants'
import { CHAINLINK, COMPOSITE, LIDO, UNISWAP, COMPOUND, YEARN } from '../../shared/constants'
import { FYDAI2203, FYDAI2206, FYUSDC2203, FYUSDC2206, EOMAR22, EOJUN22 } from '../../shared/constants'

export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const newJoins = readAddressMappingIfExists('newJoins.json')
export const newFYTokens = readAddressMappingIfExists('newFYTokens.json')
export const newPools = readAddressMappingIfExists('newPools.json')
export const newStrategies = readAddressMappingIfExists('newStrategies.json')

export const chainId = 4
export const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = new Map([
  [DAI, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [USDC, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const assets: Map<string, string> = new Map([
  [ETH, '0x21a2aea76fc8782604b7f56a1b8cdd4487d78719'],
  [DAI, '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC, '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [WBTC, '0x69A11AA0D394337570d84ce824a1ca6aFA0765DF'],
  [WSTETH, '0xf9F4D9e05503D416E95f05831A95ff43c3A01182'],
  [STETH, '0xE910c4D4802898683De478e57852738e773dBCD9'],
  [LINK, '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
  [ENS, '0x5BeAdC789F094741DEaacd5a1499aEd7E9d7FB78'],
  [UNI, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  [YVUSDC, '0x2381d065e83DDdBaCD9B4955d49D5a858AE5957B'],
])

export const joins: Map<string, string> = new Map([
  [ETH, '0xA5eaB7aA7bfC437A610Bef73c0591b8ca7D80542'],
  [DAI, '0x2555E5D167a59b545a25c81899eD15554C83DA0C'],
  [USDC, '0x7dD9F124C8a15f312CebF81419eC112C22802208'],
  [WBTC, '0xBb8Db325D6B06A44E96E44C6e2eBc7ad22628B3f'],
  [WSTETH, '0xBd337F2191b5C50E426C8eD73B72c2ddFbD8eD5c'],
  [LINK, '0x086B15D7620E7c0758F819E47Fc31F25C3b2815c'],
  [ENS, '0xbE1560cA39C51Dc380115058509D34dcd29d08a0'],
  [YVUSDC, '0x606Bda7A8f04e52AdB5a8F2814F40b71c1baAC26'],
  [UNI, '0xB890D7Bf5102Ea81492D7Ae6872F1cC3a62e052e'],
])

export const chiSources: Array<[string, string]> = [
  [DAI, '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
  [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
]

export const rateSources: Array<[string, string]> = [
  [DAI, '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'],
  [USDC, '0x5b281a6dda0b271e91ae35de655ad301c976edb1'],
]

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [DAI, assets.get(DAI) as string, ETH, assets.get(ETH) as string, '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D'],
  [USDC, assets.get(USDC) as string, ETH, assets.get(ETH) as string, '0xdCA36F27cbC4E38aE16C4E9f99D39b42337F6dcf'],
  [WBTC, assets.get(WBTC) as string, ETH, assets.get(ETH) as string, '0x2431452A0010a43878bF198e170F6319Af6d27F4'],
  [STETH, assets.get(STETH) as string, ETH, assets.get(ETH) as string, '0x17AEAA7aF619Cf60095528cB115fbE22F14dFA44'],
  [LINK, assets.get(LINK) as string, ETH, assets.get(ETH) as string, '0xFABe80711F3ea886C3AC102c81ffC9825E16162E'],
  [ENS, assets.get(ENS) as string, ETH, assets.get(ETH) as string, '0x64EB137E967D1788Ce653C4Bdd4E4aD708F50Ae6'],
  [UNI, assets.get(UNI) as string, ETH, assets.get(ETH) as string, '0x5E4FaE1eCCAc5a120e48cC02012aF1aeFF94dACc'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Rinkeby

// The lidoSource is the wstETH contract
export const lidoSource = assets.get(WSTETH) as string

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [[USDC, YVUSDC, assets.get(YVUSDC) as string]]

export const compositeSources: Array<[string, string, string]> = [
  [DAI, ETH, protocol.get(CHAINLINK) as string],
  [USDC, ETH, protocol.get(CHAINLINK) as string],
  [WBTC, ETH, protocol.get(CHAINLINK) as string],
  [STETH, ETH, protocol.get(CHAINLINK) as string],
  [WSTETH, STETH, protocol.get(LIDO) as string],
  [ENS, ETH, protocol.get(CHAINLINK) as string], // We don't use Uniswap on rinkeby
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
  [YVUSDC, assets.get(YVUSDC) as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = [[STETH, assets.get(STETH) as string]]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, joins.get(DAI) as string],
  [USDC, joins.get(USDC) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, ETH, 1400000, 2000000, 5000, 18],
  [DAI, DAI, 1000000, 10000000, 0, 18], // Constant 1, no dust
  [DAI, USDC, 1330000, 100000, 5000, 18], // Via ETH
  [DAI, WBTC, 1500000, 100000, 5000, 18], // Via ETH
  [DAI, LINK, 1670000, 1000000, 5000, 18],
  [DAI, UNI, 1670000, 1000000, 5000, 18],
  [USDC, ETH, 1400000, 5000000, 5000, 6],
  [USDC, DAI, 1330000, 100000, 5000, 6], // Via ETH
  [USDC, USDC, 1000000, 10000000, 0, 6], // Constant 1, no dust
  [USDC, WBTC, 1500000, 100000, 5000, 6], // Via ETH
  [USDC, LINK, 1670000, 1000000, 5000, 6],
  [USDC, UNI, 1670000, 1000000, 5000, 6],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const compositeDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, WSTETH, 1400000, 500000, 5000, 18],
  [USDC, WSTETH, 1400000, 500000, 5000, 6],
  [DAI, ENS, 1670000, 2000000, 5000, 18],
  [USDC, ENS, 1670000, 2000000, 5000, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const yearnDebtLimits: Array<[string, string, number, number, number, number]> = [
  [USDC, YVUSDC, 1250000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH, 3600, 714000, 500000000, 10000, 12],
  [DAI, 3600, 1000000, 1000000, 5000, 18],
  [USDC, 3600, 751000, 1000000, 5000, 6],
  [WBTC, 3600, 666000, 300000, 2100, 4],
  [LINK, 3600, 600000, 1000000, 300, 18],
  [UNI, 3600, 600000, 1000000, 100, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const compositeAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [WSTETH, 3600, 714000, 500000, 10000, 12],
  [ENS, 3600, 600000, 2000000, 300, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
export const yearnAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [YVUSDC, 3600, 600000, 1000000, 5000, 18],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2203, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
  [FYDAI2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYUSDC2206, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, YVUSDC, UNI]],
]
