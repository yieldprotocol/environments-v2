import * as base_config from '../../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

import { ETH, DAI, USDC } from '../../../../../../shared/constants'
import { FDAI2212, FUSDC2212, FETH2212, FDAI2303, FUSDC2303, FETH2303 } from '../../../../../../shared/constants'
import { FCASH_DEC22, FCASH_MAR23, FCASH_ETH, FCASH_DAI, FCASH_USDC } from '../../../../../../shared/constants'
import { FYDAI2212, FYUSDC2212, FYETH2212, FYDAI2303, FYUSDC2303, FYETH2303 } from '../../../../../../shared/constants'

/// @dev The address for fCash
export const fCashAddress = external.get('fCash') as string

/// @dev The Notional Oracle is fed with Yield Protocol asset pairs to register.
/// Since we are valuing the fCash at face value, we don't need the Notional fCash ids.
/// Note: notionalId (FDAI2203) is the id of an fCash tenor in the Yield Protocol,
/// while fCashId (FDAI2203ID) is the id of that same tenor in Notional Finance
/// @param fcash: address of the fCash contract
/// @param notionalId: asset id of an fCash tenor in the Yield Protocol
/// @param underlyingId: asset id of a borrowable asset in the Yield Protocol
/// @param underlying: contract address matching underlyingId
export const notionalSources: Array<[string, string, string, string]> = [
  [fCashAddress, FETH2212, ETH, assets.get(ETH) as string],
  [fCashAddress, FDAI2212, DAI, assets.get(DAI) as string],
  [fCashAddress, FUSDC2212, USDC, assets.get(USDC) as string],
  [fCashAddress, FETH2303, ETH, assets.get(ETH) as string],
  [fCashAddress, FDAI2303, DAI, assets.get(DAI) as string],
  [fCashAddress, FUSDC2303, USDC, assets.get(USDC) as string],
]

/// @dev Assets for which we will deploy a Join
/// @param notionalId: asset id of an fCash tenor in the Yield Protocol
/// @param fcash: address of the fCash contract
/// @param underlying: address of the fCash underlying
/// @param underlyingJoin: address of the fCash underlying Join
/// @param fCashMaturity: maturity in Notional Finance
/// @param fCashCurrency: id of the underlying in Notional Finance
export const assetsToAdd: Array<[string, string, string, string, number, string]> = [
  [FETH2212, fCashAddress, assets.get(ETH) as string, joins.get(ETH) as string, FCASH_DEC22, FCASH_ETH],
  [FDAI2212, fCashAddress, assets.get(DAI) as string, joins.get(DAI) as string, FCASH_DEC22, FCASH_DAI],
  [FUSDC2212, fCashAddress, assets.get(USDC) as string, joins.get(USDC) as string, FCASH_DEC22, FCASH_USDC],
  [FETH2303, fCashAddress, assets.get(ETH) as string, joins.get(ETH) as string, FCASH_MAR23, FCASH_ETH],
  [FDAI2303, fCashAddress, assets.get(DAI) as string, joins.get(DAI) as string, FCASH_MAR23, FCASH_DAI],
  [FUSDC2303, fCashAddress, assets.get(USDC) as string, joins.get(USDC) as string, FCASH_MAR23, FCASH_USDC],
]

/// @dev Collateralization ratio, debt ceiling, and debt dust
/// @param baseId: asset id of a borrowable asset
/// @param ilkId: asset id of a collateral asset
/// @param ratio: collateralization ratio for the base/ilk pair, with 1000000 == 100%
/// @param line: maximum debt across the protocol for the pair, with added dec
/// @param dust: minimum debt in any given vault for the pair, with added dec
/// @param dec: number of zeros to append to line and dust
export const notionalDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, FETH2212, 1100000, 400, 1, 18],
  [DAI, FDAI2212, 1100000, 500000, 5000, 18],
  [USDC, FUSDC2212, 1100000, 500000, 5000, 6],
  [ETH, FETH2303, 1100000, 400, 1, 18],
  [DAI, FDAI2303, 1100000, 500000, 5000, 18],
  [USDC, FUSDC2303, 1100000, 500000, 5000, 6],
]

/// @dev Parameters for liquidations
/// Note: fCash-collateralized positions can't get liquidated
/// @param ilkId: asset id of a collateral asset
/// @param duration: time for an auction to reach the minimum price
/// @param initialOffer: proportion of collateral to be offered at the start of an auction
/// @param auctionLine: maximum collateral of ilkId that can be simultaneously auctioned
/// @param auctionDust: minimum collateral of ilkId that can be left in a non-empty vault
/// @param ilkDec: number of zeros to append to auctionLine and auctionDust
export const auctionLimits: Array<[string, number, number, number, number, number]> = []

/// @dev Newly accepted collaterals
/// @param seriesId: series in the yield Protocol
/// @param [ilkIds]: array of asset ids to be newly accepted as collateral
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2212, [FETH2212]],
  [FYDAI2212, [FDAI2212]],
  [FYUSDC2212, [FUSDC2212]],
  [FYETH2303, [FETH2303]],
  [FYDAI2303, [FDAI2303]],
  [FYUSDC2303, [FUSDC2303]],
]
