import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC } from '../../shared/constants'
import { ACCUMULATOR, RATE, CHI } from '../../shared/constants'
import { FYDAI2203, FYUSDC2203, FYDAI2206, FYUSDC2206, EOMAR22, EOJUN22 } from '../../shared/constants'
import { WAD, ZERO, ONEUSDC, ONE64, secondsIn25Years } from '../../shared/constants'

export const protocol = readAddressMappingIfExists('protocol.json');
export const joins = readAddressMappingIfExists('joins.json');
export const fyTokens = readAddressMappingIfExists('fyTokens.json');

export const chainId = 42161
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const additionalDevelopers: Array<string> = [
  '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB',
  '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
]
export const additionalGovernors: Array<string> = []
export const whales: Map<string, string> = new Map([
  [DAI,  '0xa5a33ab9063395a90ccbea2d86a62eccf27b5742'],
  [USDC, '0xba12222222228d8ba445958a75a0704d566bf2c8'],
])

// https://tokenlists.org/token-list?url=https://bridge.arbitrum.io/token-list-42161.json
export const assets: Map<string, string> = new Map([
  [ETH,    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  [DAI,    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'],
  [USDC,   '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'],
])

export const rateChiSources: Array<[string, string, string, string]> = [
  [DAI,  RATE, WAD.toString(), WAD.toString()],
  [USDC, RATE, WAD.toString(), WAD.toString()],
  [DAI,  CHI,  WAD.toString(), WAD.toString()],
  [USDC, CHI,  WAD.toString(), WAD.toString()],
]

export const chainlinkUSDSources: Array<[string, string, string]> = [
  [ETH,   assets.get(ETH)   as string, '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612'],
  [DAI,   assets.get(DAI)   as string, '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB'],
  [USDC,  assets.get(USDC)  as string, '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3'],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH,    assets.get(ETH)    as string],
  [DAI,    assets.get(DAI)    as string],
  [USDC,   assets.get(USDC)   as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = []

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, joins.get(DAI) as string],
  [USDC, joins.get(USDC) as string]
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI,  ETH,  1400000, 1000000,  100, 18],
  [DAI,  DAI,  1000000, 10000000, 0,   18], // Constant 1, no dust
  [DAI,  USDC, 1330000, 100000,   100, 18], // Via ETH
  [USDC, ETH,  1400000, 5000000,  100, 6],
  [USDC, DAI,  1330000, 100000,   100, 6], // Via ETH
  [USDC, USDC, 1000000, 10000000, 0,   6], // Constant 1, no dust
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH,  3600, 714000, 500000000, 10000, 12],
  [DAI,  3600, 751000, 1000000,   5000,  18],
  [USDC, 3600, 751000, 1000000,   5000,  6],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203,  [ETH, DAI, USDC]],
  [FYUSDC2203, [ETH, DAI, USDC]],
  [FYDAI2206,  [ETH, DAI, USDC]],
  [FYUSDC2206, [ETH, DAI, USDC]],
]
