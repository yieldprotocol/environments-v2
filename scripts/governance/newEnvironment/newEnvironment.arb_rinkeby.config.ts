import { BigNumber } from 'ethers'
import { readAddressMappingIfExists } from '../../../shared/helpers'
import { ETH, DAI, USDC } from '../../../shared/constants'
import { CHAINLINKUSD, ACCUMULATOR, RATE, CHI } from '../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203, EODEC21, EOMAR22 } from '../../../shared/constants'
import { YSDAI6MMS,YSDAI6MJD, YSUSDC6MMS, YSUSDC6MJD, WAD, ONEUSDC } from '../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json');

export const chainId = 421611
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'

export const assets: Map<string, string> = new Map([
  [ETH,    '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681'],
  [DAI,    '0x5364Dc963c402aAF150700f38a8ef52C1D7D7F14'],
  [USDC,   '0x6079Dd4565cb1852D6c4190DB7af6C8A69f73Eae'],
])

export const rateChiSources: Array<[string, string, string, string]> = [
  [DAI,  RATE, WAD.toString(), WAD.toString()],
  [USDC, RATE, WAD.toString(), WAD.toString()],
  [DAI,  CHI,  WAD.toString(), WAD.toString()],
  [USDC, CHI,  WAD.toString(), WAD.toString()],
]

export class ChainlinkUSDSource {
  constructor (
    readonly baseId: string, 
    readonly baseAddress: string, 
    readonly sourceAddress: string) {}
}

export const chainlinkUSDSources: Array<[string, string, string]> = [
  [ETH,   assets.get(ETH)   as string, '0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8'],
  [DAI,   assets.get(DAI)   as string, '0xcAE7d280828cf4a0869b26341155E4E9b864C7b2'],
  [USDC,  assets.get(USDC)  as string, '0xe020609A0C31f4F96dCBB8DF9882218952dD95c4'],
]

// token0, token1, address, twapInterval
export const uniswapSources: Array<[string, string, string, number]> = [] // We don't use uniswap v2 in Kovan

// The lidoSource is the wstETH contract
export const lidoSource: string = ''

export const compositeSources: Array<[string, string, string]> = [
  [DAI,    ETH,   protocol.get(CHAINLINKUSD) as string],
  [USDC,   ETH,   protocol.get(CHAINLINKUSD) as string],
]

export const compositePaths: Array<[string, string, Array<string>]> = []

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [ETH,    assets.get(ETH)    as string],
  [DAI,    assets.get(DAI)    as string],
  [USDC,   assets.get(USDC)   as string],
]

// Assets for which we will have an Oracle, but not a Join
export const assetsToReserve: Array<[string, string]> = []

export const bases: Array<string> = [DAI, USDC]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  ETH,  CHAINLINKUSD, 1400000, 714000,  1000000,  1,   18],
  [DAI,  DAI,  CHAINLINKUSD, 1000000, 1000000, 10000000, 0,   18], // Constant 1, no dust
  [DAI,  USDC, CHAINLINKUSD, 1330000, 751000,  100000,   1,   18], // Via ETH
  [USDC, ETH,  CHAINLINKUSD, 1400000, 714000,  5000000,  1,   6],
  [USDC, DAI,  CHAINLINKUSD, 1330000, 751000,  100000,   1,   6], // Via ETH
  [USDC, USDC, CHAINLINKUSD, 1000000, 1000000, 10000000, 0,   6], // Constant 1, no dust
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = []

// Input data: seriesId, baseId, maturity, [ilkIds], symbol, name
export const seriesDAI: Array<[string, string, number, string[], string, string]> = [
  [FYDAI2112,  DAI,  EODEC21, [ETH, DAI, USDC], 'FYDAI2112',  'FYDAI2112'],
  [FYDAI2203,  DAI,  EOMAR22, [ETH, DAI, USDC], 'FYDAI2203',  'FYDAI2203'],
]

// Input data: seriesId, baseId, maturity, [ilkIds], symbol, name
export const seriesUSDC: Array<[string, string, number, string[], string, string]> = [
  [FYUSDC2112, USDC, EODEC21, [ETH, DAI, USDC], 'FYUSDC2112', 'FYUSDC2112'],
  [FYUSDC2203, USDC, EOMAR22, [ETH, DAI, USDC], 'FYUSDC2203', 'FYUSDC2203'],
]

export const strategiesData: Array<[string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy DAI 6M Mar Sep',  YSDAI6MMS,  DAI],
  ['Yield Strategy DAI 6M Jun Dec',  YSDAI6MJD,  DAI],
  ['Yield Strategy USDC 6M Mar Sep', YSUSDC6MMS, USDC],
  ['Yield Strategy USDC 6M Jun Dec', YSUSDC6MJD, USDC],
]

// Input data
export const strategiesInit: Array<[string, string, BigNumber]> = [
  // [strategyId, startPoolId, initAmount]
  [YSDAI6MMS,  FYDAI2203,  WAD.mul(100)],
  [YSDAI6MJD,  FYDAI2112,  WAD.mul(100)],
  [YSUSDC6MMS, FYUSDC2203, ONEUSDC.mul(100)],
  [YSUSDC6MJD, FYUSDC2112, ONEUSDC.mul(100)],
]

export const poolsInit: Array<[string, BigNumber]> = [
  // poolId, initAmount
  [FYDAI2203,  WAD.mul(100)],
  [FYDAI2112,  WAD.mul(100)],
  [FYUSDC2203, ONEUSDC.mul(100)],
  [FYUSDC2112, ONEUSDC.mul(100)],
]
