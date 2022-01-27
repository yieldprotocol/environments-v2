import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import {ETH, DAI, USDC, FYETH2203, FYETH2206, YSETH6MMS, YSETH6MJD} from '../../../../shared/constants'
import { ACCUMULATOR, RATE, CHI } from '../../../../shared/constants'
import { FYDAI2203, FYUSDC2203, FYDAI2206, FYUSDC2206, EOMAR22, EOJUN22 } from '../../../../shared/constants'
import { YSDAI6MMS,YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD } from '../../../../shared/constants'
import { WAD, ZERO, ONEUSDC, ONE64, secondsIn25Years } from '../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');
const joins = readAddressMappingIfExists('joins.json');
const fyTokens = readAddressMappingIfExists('fyTokens.json');

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
  [ETH,  '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const assets: Map<string, string> = new Map([
  [ETH,    '0xb3B95E6AeE64b403D0586379F0073b0437F85c13'],
  [DAI,    '0x358871f2F233Ee078743be4D965FAc23Bb0bFeDd'],
  [USDC,   '0x461B6d0E560C27AD1C383DE0b1a0d1eF13Dcb0E6'],
])

export const rateChiSources: Array<[string, string, string, string]> = [
  [DAI,  RATE, WAD.toString(), WAD.toString()],
  [USDC, RATE, WAD.toString(), WAD.toString()],
  [ETH,  RATE, WAD.toString(), WAD.toString()],
  [DAI,  CHI,  WAD.toString(), WAD.toString()],
  [USDC, CHI,  WAD.toString(), WAD.toString()],
  [ETH,  CHI,  WAD.toString(), WAD.toString()],
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
  [USDC, joins.get(USDC) as string],
  [ETH, joins.get(ETH) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI,  ETH,  1400000,  1000000,  100, 18],
  [DAI,  DAI,  1000000,  10000000, 0,   18], // Constant 1, no dust
  [DAI,  USDC, 1330000,  100000,   100, 18], // Via ETH
  [USDC, ETH,  1400000,  5000000,  100, 6],
  [USDC, DAI,  1330000,  100000,   100, 6], // Via ETH
  [USDC, USDC, 1000000,  10000000, 0,   6], // Constant 1, no dust
  [ETH,  DAI,  1400000,  10000000, 100, 18], // TODO: Is the limit in USD or ETH????
  [ETH,  USDC, 1400000,  10000000, 100, 18], // TODO: Is the limit in USD or ETH????
  [ETH,  ETH,  1000000,  1000000,  0,   18], // Constant 1, no dust
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [ETH,  3600, 714000,  2000000,  10000, 12],
  [DAI,  3600, 1000000, 10000000, 5000,  18],
  [USDC, 3600, 751000,  100000,   5000,  6],
]

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYDAI2203,  DAI,  protocol.get(ACCUMULATOR) as string, joins.get(DAI) as string,  EOMAR22, 'FYDAI2203',  'FYDAI2203'],
  [FYUSDC2203, USDC, protocol.get(ACCUMULATOR) as string, joins.get(USDC) as string, EOMAR22, 'FYUSDC2203', 'FYUSDC2203'],
  [FYDAI2206,  DAI,  protocol.get(ACCUMULATOR) as string, joins.get(DAI) as string,  EOJUN22, 'FYDAI2206',  'FYDAI2206'],
  [FYUSDC2206, USDC, protocol.get(ACCUMULATOR) as string, joins.get(USDC) as string, EOJUN22, 'FYUSDC2206', 'FYUSDC2206'],
  [FYETH2203,  ETH,  protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string,  EOMAR22, 'FYETH2203',  'FYETH2203'],
  [FYETH2206,  ETH,  protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string,  EOJUN22, 'FYETH2206',  'FYETH2206'],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203,  [ETH, DAI, USDC]],
  [FYUSDC2203, [ETH, DAI, USDC]],
  [FYETH2203,  [ETH, DAI, USDC]],
  [FYDAI2206,  [ETH, DAI, USDC]],
  [FYUSDC2206, [ETH, DAI, USDC]],
  [FYETH2206,  [ETH, DAI, USDC]],
]

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [FYDAI2203,  assets.get(DAI) as string,  fyTokens.get(FYDAI2203) as string,  ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
  [FYUSDC2203, assets.get(USDC) as string, fyTokens.get(FYUSDC2203) as string, ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
  [FYETH2203,  assets.get(ETH) as string,  fyTokens.get(FYETH2203) as string,  ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
  [FYDAI2206,  assets.get(DAI) as string,  fyTokens.get(FYDAI2206) as string,  ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
  [FYUSDC2206, assets.get(USDC) as string, fyTokens.get(FYUSDC2206) as string, ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
  [FYETH2206,  assets.get(ETH) as string,  fyTokens.get(FYETH2206) as string,  ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
]

// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYDAI2203,  DAI,  WAD.mul(100),     ZERO],
  [FYUSDC2203, USDC, ONEUSDC.mul(100), ZERO],
  [FYETH2203,  DAI,  WAD,                    ZERO],
  [FYDAI2206,  DAI,  WAD.mul(100),     ZERO],
  [FYUSDC2206, USDC, ONEUSDC.mul(100), ZERO],
  [FYETH2206,  DAI,  WAD,                    ZERO],
]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy DAI 6M Mar Sep',  YSDAI6MMS,  DAI],
  ['Yield Strategy DAI 6M Jun Dec',  YSDAI6MJD,  DAI],
  ['Yield Strategy USDC 6M Mar Sep', YSUSDC6MMS, USDC],
  ['Yield Strategy USDC 6M Jun Dec', YSUSDC6MJD, USDC],
  ['Yield Strategy ETH 6M Mar Sep',  YSETH6MMS,  ETH],
  ['Yield Strategy ETH 6M Jun Dec',  YSETH6MJD,  ETH],
]

// Input data
export const strategiesInit: Array<[string, string, BigNumber]> = [
  // [strategyId, startPoolId, initAmount]
  [YSDAI6MMS,  FYDAI2203,  WAD.mul(100)],
  [YSDAI6MJD,  FYDAI2206,  WAD.mul(100)],
  [YSUSDC6MMS, FYUSDC2203, ONEUSDC.mul(100)],
  [YSUSDC6MJD, FYUSDC2206, ONEUSDC.mul(100)],
  [YSETH6MMS,  FYETH2203,  WAD],
  [YSETH6MJD,  FYETH2206,  WAD],
]