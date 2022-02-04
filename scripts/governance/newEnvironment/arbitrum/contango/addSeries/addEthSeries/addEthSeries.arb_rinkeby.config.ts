import {BigNumber} from 'ethers'
import {
    ACCUMULATOR,
    CHI,
    DAI,
    EOJUN22,
    EOMAR22,
    ETH,
    FYETH2203,
    FYETH2206, ONE64,
    RATE, secondsIn25Years,
    USDC,
    WAD,
    YSETH6MJD,
    YSETH6MMS,
    ZERO
} from '../../../../../../../shared/constants'
import {readAddressMappingIfExists} from "../../../../../../../shared/helpers";

import * as base_config from "../../../newEnvironment.arb_rinkeby.config";

export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = new Map([
    [DAI,  '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [USDC, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [ETH,  '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

const protocol = readAddressMappingIfExists('protocol.json');
const joins = readAddressMappingIfExists('joins.json');
const fyTokens = readAddressMappingIfExists('fyTokens.json');

export const assets: Map<string, string> = new Map([
    [ETH,    '0xb3B95E6AeE64b403D0586379F0073b0437F85c13'],
    [DAI,    '0x358871f2F233Ee078743be4D965FAc23Bb0bFeDd'],
    [USDC,   '0x461B6d0E560C27AD1C383DE0b1a0d1eF13Dcb0E6'],
])

export const rateChiSources: Array<[string, string, string, string]> =  [
    [ETH, RATE, WAD.toString(), WAD.toString()],
    [ETH, CHI,  WAD.toString(), WAD.toString()],
]

export const chainlinkUSDSources: Array<[string, string, string]> = []

// Assets that will be made into a base
export const bases: Array<[string, string]> = [
    [ETH, joins.get(ETH) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
    [ETH, DAI, 1400000, 250000000, 50, 8], // TODO: Is the limit in USD or ETH????
    [ETH, USDC, 1400000, 250000000, 50, 8], // TODO: Is the limit in USD or ETH????
    [ETH, ETH, 1000000, 1000000, 0, 8], // Constant 1, no dust
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const chainlinkAuctionLimits: Array<[string, number, number, number, number, number]> = base_config.chainlinkAuctionLimits

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
    [FYETH2203, ETH, protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string, EOMAR22, 'FYETH2203', 'FYETH2203'],
    [FYETH2206, ETH, protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string, EOJUN22, 'FYETH2206', 'FYETH2206'],
]

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
    [FYETH2203,  assets.get(ETH) as string,  fyTokens.get(FYETH2203) as string,  ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
    [FYETH2206,  assets.get(ETH) as string,  fyTokens.get(FYETH2206) as string,  ONE64.div(secondsIn25Years), ONE64.mul(75).div(100), ONE64.mul(100).div(75)],
]

// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
    [FYETH2203, DAI, WAD, ZERO],
    [FYETH2206, DAI, WAD, ZERO],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
    [FYETH2203,  [ETH, DAI, USDC]],
    [FYETH2206,  [ETH, DAI, USDC]],
]

export const strategiesData: Array<[string, string, string]> = [
    // name, symbol, baseId
    ['Yield Strategy ETH 6M Mar Sep', YSETH6MMS, ETH],
    ['Yield Strategy ETH 6M Jun Dec', YSETH6MJD, ETH],
]

// Input data
export const strategiesInit: Array<[string, string, BigNumber]> = [
    // [strategyId, startPoolId, initAmount]
    [YSETH6MMS, FYETH2203, WAD],
    [YSETH6MJD, FYETH2206, WAD],
]
