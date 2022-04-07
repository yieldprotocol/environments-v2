import { BigNumber } from 'ethers'
import {
  ACCUMULATOR,
  CHI,
  DAI,
  EOSEP22,
  EOMAR23,
  ETH,
  FYFRAX2209,
  FYFRAX2303,
  ONE64,
  RATE,
  secondsIn40Years,
  USDC,
  WBTC,
  LINK,
  STETH,
  WSTETH,
  ENS,
  UNI,
  YVUSDC,
  FRAX,
  WAD,
  YSFRAX1YEV,
  YSFRAX1YOD,
  ZERO,
  CHAINLINK,
  COMPOSITE,
  YEARN,
} from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.rinkeby.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies
export const newJoins: Map<string, string> = readAddressMappingIfExists('newJoins.json')

export const rateChiSources: Array<[string, string, string, string]> = [
  [FRAX, RATE, WAD.toString(), WAD.toString()],
  [FRAX, CHI, WAD.toString(), WAD.toString()],
]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [[FRAX, newJoins.get(FRAX) as string]]

export const assetsToAdd: Map<string, string> = new Map([[FRAX, protocol.get('fraxMock') as string]])

export const chainlinkSources: Array<[string, string, string, string, string]> = [
  [FRAX, protocol.get('fraxMock') as string, ETH, assets.get(ETH) as string, protocol.get('fraxOracleMock') as string],
]

export const newChiSources: Array<[string, string]> = [[FRAX, protocol.get(ACCUMULATOR) as string]]

export const newRateSources: Array<[string, string]> = [[FRAX, protocol.get(ACCUMULATOR) as string]]

export const compositeSources: Array<[string, string, string]> = [
  [FRAX, ETH, protocol.get(CHAINLINK) as string],
  [UNI, ETH, protocol.get(CHAINLINK) as string],
  [LINK, ETH, protocol.get(CHAINLINK) as string],
  // [USDC, YVUSDC, protocol.get(YEARN) as string],
]

export const newCompositePaths: Array<[string, string, Array<string>]> = [
  [FRAX, USDC, [ETH]],
  [FRAX, DAI, [ETH]],
  [FRAX, ENS, [ETH]],
  [FRAX, LINK, [ETH]],
  [FRAX, UNI, [ETH]],
  [FRAX, WBTC, [ETH]],
  [FRAX, WSTETH, [ETH, STETH]],
  // [FRAX, YVUSDC, [ETH, USDC]],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const newChainlinkLimits: Array<[string, string, number, number, number, number]> = [
  [FRAX, ETH, 1400000, 500000, 5000, 18],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const newCompositeLimits: Array<[string, string, number, number, number, number]> = [
  [FRAX, WSTETH, 1400000, 500000, 5000, 18],
  [FRAX, USDC, 1330000, 100000, 5000, 18],
  [FRAX, ENS, 1670000, 2000000, 5000, 18],
  [FRAX, DAI, 1330000, 100000, 5000, 18],
  [FRAX, LINK, 1670000, 1000000, 5000, 18],
  [FRAX, UNI, 1670000, 1000000, 5000, 18],
  [FRAX, WBTC, 1500000, 100000, 5000, 18],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const newUniswapLimits: Array<[string, string, number, number, number, number]> = [
  //  [ETH, ENS, 1500000, 250000000, 10000, 12],
]

// export const yearnDebtLimits: Array<[string, string, number, number, number, number]> = [
//   [FRAX, YVUSDC, 1250000, 1000000, 5000, 6],
// ]

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [
    FYFRAX2209,
    FRAX,
    protocol.get(ACCUMULATOR) as string,
    newJoins.get(FRAX) as string,
    EOSEP22,
    'FYFRAX2209',
    'FYFRAX2209',
  ],
  [
    FYFRAX2303,
    FRAX,
    protocol.get(ACCUMULATOR) as string,
    newJoins.get(FRAX) as string,
    EOMAR23,
    'FYFRAX2303',
    'FYFRAX2303',
  ],
]

// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee), g2 (Sell fyToken to the pool fee)
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYFRAX2209,
    protocol.get('fraxMock') as string,
    newFYTokens.get(FYFRAX2209) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
  [
    FYFRAX2303,
    protocol.get('fraxMock') as string,
    newFYTokens.get(FYFRAX2303) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYFRAX2209, FRAX, WAD, ZERO],
  [FYFRAX2303, FRAX, WAD, ZERO],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYFRAX2209, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
  [FYFRAX2303, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI]],
]

export const strategiesData: Array<[string, string, string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy FRAX 1Y Even', YSFRAX1YEV, FRAX, newJoins.get(FRAX) as string, protocol.get('fraxMock') as string],
  ['Yield Strategy FRAX 1Y Odd', YSFRAX1YOD, FRAX, newJoins.get(FRAX) as string, protocol.get('fraxMock') as string],
]

// Input data
export const strategiesInit: Array<[string, string, string, BigNumber]> = [
  // [strategyId, startPoolAddress, startPoolId, initAmount]
  [YSFRAX1YEV, newPools.get(FYFRAX2209) as string, FYFRAX2209, WAD],
  [YSFRAX1YOD, newPools.get(FYFRAX2303) as string, FYFRAX2303, WAD],
]