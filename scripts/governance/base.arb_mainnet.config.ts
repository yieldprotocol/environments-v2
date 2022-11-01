import { readAddressMappingIfExists } from '../../shared/helpers'
import { CHI, DAI, ETH, RATE, USDC, WAD } from '../../shared/constants'

import { FYETH2203, FYETH2206, FYETH2209, FYETH2212, FYETH2303 } from '../../shared/constants'
import { FYDAI2203, FYDAI2206, FYDAI2209, FYDAI2212, FYDAI2303 } from '../../shared/constants'
import { FYUSDC2203, FYUSDC2206, FYUSDC2209, FYUSDC2212, FYUSDC2303 } from '../../shared/constants'

export const external = readAddressMappingIfExists('external.json')
export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const assets = readAddressMappingIfExists('assets.json')
export const joins = readAddressMappingIfExists('joins.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const pools = readAddressMappingIfExists('pools.json')
export const strategies = readAddressMappingIfExists('strategies.json')
export const newJoins = readAddressMappingIfExists('newJoins.json')
export const newFYTokens = readAddressMappingIfExists('newFYTokens.json')
export const newPools = readAddressMappingIfExists('newPools.json')
export const newStrategies = readAddressMappingIfExists('newStrategies.json')

export const chainId = 42161
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const additionalDevelopers: Array<string> = [
  '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB',
  '0xfe90d993367bc93D171A5ED88ab460759DE2bED6',
]

export const additionalGovernors: Array<string> = []
export const whales: Map<string, string> = new Map([
  [ETH, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [DAI, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [USDC, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
])

export const rateChiSources: Array<[string, string, string, string]> = [
  [DAI, RATE, WAD.toString(), WAD.toString()],
  [USDC, RATE, WAD.toString(), WAD.toString()],
  [DAI, CHI, WAD.toString(), WAD.toString()],
  [USDC, CHI, WAD.toString(), WAD.toString()],
]

export const chainlinkUSDSources: Array<[string, string, string]> = [
  [ETH, assets.get(ETH) as string, '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612'],
  [DAI, assets.get(DAI) as string, '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB'],
  [USDC, assets.get(USDC) as string, '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3'],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH, assets.get(ETH) as string],
  [DAI, assets.get(DAI) as string],
  [USDC, assets.get(USDC) as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = []

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
  [DAI, joins.get(DAI) as string],
  [USDC, joins.get(USDC) as string],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, ETH, 1400000, 1000000, 100, 18],
  [DAI, DAI, 1000000, 10000000, 0, 18], // Constant 1, no dust
  [DAI, USDC, 1330000, 100000, 100, 18], // Via ETH
  [USDC, ETH, 1400000, 5000000, 100, 6],
  [USDC, DAI, 1330000, 100000, 100, 6], // Via ETH
  [USDC, USDC, 1000000, 10000000, 0, 6], // Constant 1, no dust
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH, 3600, 714000, 500000000, 10000, 12],
  [DAI, 3600, 751000, 1000000, 5000, 18],
  [USDC, 3600, 751000, 1000000, 5000, 6],
]

// baseId, accepted ilks
export const ilks: Map<string, string[]> = new Map([
  [DAI, [ETH, DAI, USDC]],
  [USDC, [ETH, DAI, USDC]],
  [ETH, [ETH, DAI, USDC]],
])

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203, ilks.get(DAI)!],
  [FYDAI2206, ilks.get(DAI)!],
  [FYDAI2209, ilks.get(DAI)!],
  [FYDAI2212, ilks.get(DAI)!],
  [FYDAI2303, ilks.get(DAI)!],

  [FYUSDC2203, ilks.get(USDC)!],
  [FYUSDC2206, ilks.get(USDC)!],
  [FYUSDC2209, ilks.get(USDC)!],
  [FYUSDC2212, ilks.get(USDC)!],
  [FYUSDC2303, ilks.get(USDC)!],

  [FYETH2203, ilks.get(ETH)!],
  [FYETH2206, ilks.get(ETH)!],
  [FYETH2209, ilks.get(ETH)!],
  [FYETH2212, ilks.get(ETH)!],
  [FYETH2303, ilks.get(ETH)!],
]
