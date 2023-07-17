import * as base_config from '../../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const series: Map<string, Series> = base_config.series

import { ETH, DAI, USDC, FCASH } from '../../../../../../shared/constants'
import { FDAI2312, FUSDC2312, FETH2312 } from '../../../../../../shared/constants'

import { OracleSource, Ilk, Series } from '../../../../confTypes'

/// @dev The address for fCash
export const fCashAddress = external.getOrThrow(FCASH)!

/// @notice The Notional Oracle is fed with Yield Protocol asset pairs to register
/// @param Base asset identifier (bytes6 tag) - asset id of a borrowable asset in the Yield Protocol
/// @param Address for the base asset
/// @param Quote asset identifier (bytes6 tag) - notionalId (FDAI2203) is the id of an fCash tenor in the Yield Protocol
/// @param Unused
/// @param Unused
export const newSources: OracleSource[] = [
  {
    baseId: ETH,
    baseAddress: assets.getOrThrow(ETH)!,
    quoteId: FETH2312,
    quoteAddress: fCashAddress,
    sourceAddress: fCashAddress,
  },
  {
    baseId: DAI,
    baseAddress: assets.getOrThrow(DAI)!,
    quoteId: FDAI2312,
    quoteAddress: fCashAddress,
    sourceAddress: fCashAddress,
  },
  {
    baseId: USDC,
    baseAddress: assets.getOrThrow(USDC)!,
    quoteId: FUSDC2312,
    quoteAddress: fCashAddress,
    sourceAddress: fCashAddress,
  },
]

// ----- ASSETS, BASES, ILKS -----

export const newAssets = [base_config.fETH2312, base_config.fDAI2312, base_config.fUSDC2312]

/// @dev Newly accepted collaterals
export const newIlks: Array<[Series, Ilk]> = [
  [base_config.fyETH2312, base_config.ilkETHFETH2312],
  [base_config.fyDAI2312, base_config.ilkDAIFDAI2312],
  [base_config.fyUSDC2312, base_config.ilkUSDCFUSDC2312],
]

export const newJoins: Array<string> = [
  joins.getOrThrow(FETH2312)!,
  joins.getOrThrow(FDAI2312)!,
  joins.getOrThrow(FUSDC2312)!,
]
