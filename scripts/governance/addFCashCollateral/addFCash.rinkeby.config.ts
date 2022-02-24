import * as base_config from '../base.rinkeby.config'

export const developer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer: string = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

import { USDC, DAI, FCASH } from '../../../shared/constants'
import { FUSDC2203, FUSDC2206, FDAI2203, FDAI2206 } from '../../../shared/constants'
import { FUSDC2203ID, FUSDC2206ID, FDAI2203ID, FDAI2206ID } from '../../../shared/constants'
import { FYUSDC2203, FYUSDC2206, FYDAI2203, FYDAI2206 } from '../../../shared/constants'

export const newAssets: Map<string, string> = new Map([[FCASH, '0xbb7Fa5ec50E47af7e80fa110dac1d4F57C8B6797']])

// fcash, notionalId, underlyingId, underlying
export const notionalSources: Array<[string, string, string, string]> = [
  [newAssets.get(FCASH) as string, FDAI2203, DAI, assets.get(DAI) as string],
  [newAssets.get(FCASH) as string, FDAI2206, DAI, assets.get(DAI) as string],
  [newAssets.get(FCASH) as string, FUSDC2203, USDC, assets.get(USDC) as string],
  [newAssets.get(FCASH) as string, FUSDC2206, USDC, assets.get(USDC) as string],
]

// Assets for which we will have a Join
// assetId, fCashId, fCash
export const assetsToAdd: Array<[string, number, string]> = [
  [FDAI2203, FDAI2203ID, newAssets.get(FCASH) as string],
  [FDAI2206, FDAI2206ID, newAssets.get(FCASH) as string],
  [FUSDC2203, FUSDC2203ID, newAssets.get(FCASH) as string],
  [FUSDC2206, FUSDC2206ID, newAssets.get(FCASH) as string],
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
