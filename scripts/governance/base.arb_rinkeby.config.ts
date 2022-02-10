import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC } from '../../shared/constants'
import { ACCUMULATOR, RATE, CHI } from '../../shared/constants'
import { FYDAI2203, FYUSDC2203, FYDAI2206, FYUSDC2206, EOMAR22, EOJUN22 } from '../../shared/constants'
import { YSDAI6MMS,YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD } from '../../shared/constants'
import { WAD, ZERO, ONEUSDC, ONE64, secondsIn25Years } from '../../shared/constants'

export const protocol = readAddressMappingIfExists('protocol.json');
export const joins = readAddressMappingIfExists('joins.json');
export const fyTokens = readAddressMappingIfExists('fyTokens.json');

export const chainId = 421611
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const additionalDevelopers: Array<string> = []
export const additionalGovernors: Array<string> = [
  '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A',
  '0xE7aa7AF667016837733F3CA3809bdE04697730eF'
]
export const whales: Map<string, string> = new Map([
  [DAI,  '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [USDC, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const assets: Map<string, string> = new Map([
  [ETH,    '0xb3B95E6AeE64b403D0586379F0073b0437F85c13'],
  [DAI,    '0x358871f2F233Ee078743be4D965FAc23Bb0bFeDd'],
  [USDC,   '0x461B6d0E560C27AD1C383DE0b1a0d1eF13Dcb0E6'],
])

export const rateChiSources: Array<[string, string, string, string]> = [
  [DAI,  RATE, WAD.toString(), WAD.toString()],
  [USDC, RATE, WAD.toString(), WAD.toString()],
  [DAI,  CHI,  WAD.toString(), WAD.toString()],
  [USDC, CHI,  WAD.toString(), WAD.toString()],
]

export const chainlinkUSDSources: Array<[string, string, string]> = [
  [ETH,   assets.get(ETH)   as string, '0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8'],
  [DAI,   assets.get(DAI)   as string, '0xcAE7d280828cf4a0869b26341155E4E9b864C7b2'],
  [USDC,  assets.get(USDC)  as string, '0xe020609A0C31f4F96dCBB8DF9882218952dD95c4'],
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
  [DAI,  ETH,  1400000,  1000000,  100, 18],
  [DAI,  DAI,  1000000, 10000000, 0,   18], // Constant 1, no dust
  [DAI,  USDC, 1330000,  100000,   100, 18], // Via ETH
  [USDC, ETH,  1400000,  5000000,  100, 6],
  [USDC, DAI,  1330000,  100000,   100, 6], // Via ETH
  [USDC, USDC, 1000000, 10000000, 0,   6], // Constant 1, no dust
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH,  3600, 714000,  2000000,  10000, 12],
  [DAI,  3600, 1000000, 10000000, 5000,  18],
  [USDC, 3600, 751000,  100000,   5000,  6],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203,  [ETH, DAI, USDC]],
  [FYUSDC2203, [ETH, DAI, USDC]],
  [FYDAI2206,  [ETH, DAI, USDC]],
  [FYUSDC2206, [ETH, DAI, USDC]],
]
