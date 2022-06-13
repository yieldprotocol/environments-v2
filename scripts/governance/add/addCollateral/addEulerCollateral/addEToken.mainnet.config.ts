import * as base_config from '../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

import { DAI, EDAI, FYDAI2203 } from '../../../../../shared/constants'

export const assets: Map<string, string> = new Map([[EDAI, '0xe025E3ca2bE02316033184551D4d3Aa22024D9DC']])

// underlyingId, eTokenId, eTokenAddress
export const eulerSources: Array<[string, string, string]> = [[DAI, EDAI, assets.get(EDAI) as string]]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [[EDAI, assets.get(EDAI) as string]]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const debtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, EDAI, 1250000, 1000000, 5000, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
export const auctionLimits: Array<[string, number, number, number, number, number]> = [
  [EDAI, 3600, 600000, 1000000, 2, 18],
]

// Input data: seriesId, [ilkIds]
export const seriesIlks: Array<[string, string[]]> = [[FYDAI2203, [EDAI]]]
