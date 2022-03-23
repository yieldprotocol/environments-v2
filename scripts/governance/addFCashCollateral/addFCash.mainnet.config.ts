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
import { FUSDC2206, FDAI2206, FUSDC2209, FDAI2209 } from '../../../shared/constants'
import { FCASH_JUN22, FCASH_SEP22, FCASH_DAI, FCASH_USDC } from '../../../shared/constants'
import { FYUSDC2206, FYDAI2206, FYUSDC2209, FYDAI2209 } from '../../../shared/constants'

export const fCashAddress = '0x1344A36A1B56144C3Bc62E7757377D288fDE0669'

// fcash, notionalId, underlyingId, underlying
export const notionalSources: Array<[string, string, string, string]> = [
  [fCashAddress, FDAI2206, DAI, assets.get(DAI) as string],
  [fCashAddress, FUSDC2206, USDC, assets.get(USDC) as string],
  [fCashAddress, FDAI2209, DAI, assets.get(DAI) as string],
  [fCashAddress, FUSDC2209, USDC, assets.get(USDC) as string],
]

// Assets for which we will have a Join
// assetId, fCashId, fCash
export const assetsToAdd: Array<[string, string, string, number, string]> = [
  [FDAI2206, fCashAddress, assets.get(DAI) as string, FCASH_JUN22, FCASH_DAI],
  [FUSDC2206, fCashAddress, assets.get(USDC) as string, FCASH_JUN22, FCASH_USDC],
  [FDAI2209, fCashAddress, assets.get(DAI) as string, FCASH_SEP22, FCASH_DAI],
  [FUSDC2209, fCashAddress, assets.get(USDC) as string, FCASH_SEP22, FCASH_USDC],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const notionalDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, FDAI2206, 1100000, 5000000, 5000, 18],
  [USDC, FUSDC2206, 1100000, 5000000, 5000, 6],
  [DAI, FDAI2209, 1100000, 5000000, 5000, 18],
  [USDC, FUSDC2209, 1100000, 5000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
// Fcash cannot get liquidated
export const auctionLimits: Array<[string, number, number, number, number, number]> = []

// Input data: seriesId, [ilkIds]
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2206, [FDAI2206]],
  [FYUSDC2206, [FUSDC2206]],
  [FYDAI2209, [FDAI2209]],
  [FYUSDC2209, [FUSDC2209]],
]
