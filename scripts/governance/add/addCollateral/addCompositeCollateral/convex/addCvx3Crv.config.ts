import {
  CVX3CRV,
  DAI,
  ETH,
  FYDAI2206,
  FYDAI2209,
  FYUSDC2206,
  FYUSDC2209,
  USDC,
} from '../../../../../../shared/constants'

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, CVX3CRV, [ETH]],
  [USDC, CVX3CRV, [ETH]],
]

/// @notice Configure an asset as an ilk for a base using the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const compositeDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, CVX3CRV, 1000000, 10000, 500, 18],
  [USDC, CVX3CRV, 1000000, 10000, 500, 6],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2206, [CVX3CRV]],
  [FYDAI2209, [CVX3CRV]],
  [FYUSDC2206, [CVX3CRV]],
  [FYUSDC2209, [CVX3CRV]],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param duration of auctions in seconds
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const compositeAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [CVX3CRV, 3600, 714000, 500000, 10000, 12],
]
