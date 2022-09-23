import * as base_config from '../../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

import { USDC, DAI } from '../../../../../../shared/constants'
import { FUSDC2212, FDAI2212, FUSDC2303, FDAI2303 } from '../../../../../../shared/constants'
import { FYUSDC2303, FYDAI2303 } from '../../../../../../shared/constants'

export const fCashAddress = '0x1344A36A1B56144C3Bc62E7757377D288fDE0369'

/// @dev The Notional Oracle is fed with Yield Protocol asset pairs to register.
/// Since we are valuing the fCash at face value, we don't need the Notional fCash ids.
/// Note: notionalId (FDAI2203) is the id of an fCash tenor in the Yield Protocol,
/// while fCashId (FDAI2203ID) is the id of that same tenor in Notional Finance
/// @param fcash: address of the fCash contract
/// @param notionalId: asset id of an fCash tenor in the Yield Protocol
/// @param underlyingId: asset id of a borrowable asset in the Yield Protocol
/// @param underlying: contract address matching underlyingId
export const notionalSources: Array<[string, string, string, string]> = [
  [fCashAddress, FDAI2303, DAI, assets.get(DAI) as string],
  [fCashAddress, FUSDC2303, USDC, assets.get(USDC) as string],
]

/// @dev NotionalJoins to deploy. The new NotionalJoin will be like the old NotionalJoin,
/// but for the next quarter
/// @param oldJoinId: existing NotionalJoin to copy data from
/// @param newJoinId: assetId to use for the new NotionaJoin
export const notionalJoins: Array<[string, string]> = [
  [FDAI2212, FDAI2303],
  [FUSDC2212, FUSDC2303],
]

/// @dev Collateralization ratio, debt ceiling, and debt dust
/// @param baseId: asset id of a borrowable asset
/// @param ilkId: asset id of a collateral asset
/// @param ratio: collateralization ratio for the base/ilk pair, with 1000000 == 100%
/// @param line: maximum debt across the protocol for the pair, with added dec
/// @param dust: minimum debt in any given vault for the pair, with added dec
/// @param dec: number of zeros to append to line and dust
export const notionalDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, FDAI2303, 1100000, 5000000, 5000, 18],
  [USDC, FUSDC2303, 1100000, 5000000, 5000, 6],
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
  [FYDAI2303, [FDAI2303]],
  [FYUSDC2303, [FUSDC2303]],
]
