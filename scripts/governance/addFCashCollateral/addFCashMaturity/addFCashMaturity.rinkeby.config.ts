import * as base_config from '../../base.rinkeby.config'

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

import { USDC, DAI } from '../../../../shared/constants'
import { FUSDC2209, FDAI2209 } from '../../../../shared/constants'
import { FCASH_SEP22, FCASH_DAI, FCASH_USDC } from '../../../../shared/constants'
import { FYUSDC2209, FYDAI2209 } from '../../../../shared/constants'

export const fCashAddress = '0xbb7Fa5ec50E47af7e80fa110dac1d4F57C8B6797'

// fcash, notionalId, underlyingId, underlying
export const notionalSources: Array<[string, string, string, string]> = [
  [fCashAddress, FDAI2209, DAI, assets.get(DAI) as string],
  [fCashAddress, FUSDC2209, USDC, assets.get(USDC) as string],
]

// Assets for which we will have a Join
// assetId, fCashId, fCash
export const assetsToAdd: Array<[string, string, string, number, string]> = [
  [FDAI2209, fCashAddress, assets.get(DAI) as string, FCASH_SEP22, FCASH_DAI],
  [FUSDC2209, fCashAddress, assets.get(USDC) as string, FCASH_SEP22, FCASH_USDC],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const notionalDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, FDAI2209, 1100000, 1000000, 5000, 18],
  [USDC, FUSDC2209, 1100000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
// Fcash cannot get liquidated
export const auctionLimits: Array<[string, number, number, number, number, number]> = []

// Input data: seriesId, [ilkIds]
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2209, [FDAI2209]],
  [FYUSDC2209, [FUSDC2209]],
]
