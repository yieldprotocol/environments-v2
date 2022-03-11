import * as base_config from '../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

import { USDC, DAI } from '../../../shared/constants'
import { FUSDC2203, FUSDC2206, FDAI2203, FDAI2206 } from '../../../shared/constants'
import { FUSDC2203ID, FUSDC2206ID, FDAI2203ID, FDAI2206ID } from '../../../shared/constants'
import { FYUSDC2203, FYUSDC2206, FYDAI2203, FYDAI2206 } from '../../../shared/constants'

export const fCashAddress = '0x1344A36A1B56144C3Bc62E7757377D288fDE0369'

// fcash, notionalId, underlyingId, underlying
export const notionalSources: Array<[string, string, string, string]> = [
  [fCashAddress, FDAI2203, DAI, assets.get(DAI) as string],
  [fCashAddress, FDAI2206, DAI, assets.get(DAI) as string],
  [fCashAddress, FUSDC2203, USDC, assets.get(USDC) as string],
  [fCashAddress, FUSDC2206, USDC, assets.get(USDC) as string],
]

// Assets for which we will have a Join
// assetId, fCashId, fCash
export const assetsToAdd: Array<[string, number, string]> = [
  [FDAI2203, FDAI2203ID, fCashAddress],
  [FDAI2206, FDAI2206ID, fCashAddress],
  [FUSDC2203, FUSDC2203ID, fCashAddress],
  [FUSDC2206, FUSDC2206ID, fCashAddress],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const notionalDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, FDAI2203, 1100000, 1000000, 5000, 18],
  [DAI, FDAI2206, 1100000, 1000000, 5000, 18],
  [USDC, FUSDC2203, 1100000, 1000000, 5000, 6],
  [USDC, FUSDC2206, 1100000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
// Fcash cannot get liquidated
export const auctionLimits: Array<[string, number, number, number, number, number]> = []

// Input data: seriesId, [ilkIds]
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203, [FDAI2203]],
  [FYDAI2206, [FDAI2206]],
  [FYUSDC2203, [FUSDC2203]],
  [FYUSDC2206, [FUSDC2206]],
]