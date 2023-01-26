import * as base_config from '../../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const series: Map<string, Series> = base_config.series

import { ETH, DAI, USDC, FCASH, NOTIONAL } from '../../../../../../shared/constants'
import { FDAI2309, FUSDC2309, FETH2309 } from '../../../../../../shared/constants'
import { FYDAI2309, FYUSDC2309, FYETH2309 } from '../../../../../../shared/constants'

import { Asset, OracleSource, Ilk, Series } from '../../../../confTypes'

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
    quoteId: FETH2309,
    quoteAddress: fCashAddress,
    sourceAddress: fCashAddress,
  },
]

// ----- ASSETS, BASES, ILKS -----

const fETH2309: Asset = {
  assetId: FETH2309,
  address: fCashAddress,
}

const fDAI2309: Asset = {
  assetId: FDAI2309,
  address: fCashAddress,
}

const fUSDC2309: Asset = {
  assetId: FUSDC2309,
  address: fCashAddress,
}

export const newAssets = [fETH2309, fDAI2309, fUSDC2309]

const ilkETHFETH2309: Ilk = {
  baseId: ETH,
  ilkId: FETH2309,
  asset: {
    assetId: FETH2309,
    address: fCashAddress,
  },
  collateralization: {
    baseId: ETH,
    ilkId: FETH2309,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: FETH2309,
    line: 400,
    dust: 1,
    dec: 18,
  },
}

const ilkDAIFDAI2309: Ilk = {
  baseId: DAI,
  ilkId: FDAI2309,
  asset: {
    assetId: FDAI2309,
    address: fCashAddress,
  },
  collateralization: {
    baseId: DAI,
    ilkId: FDAI2309,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: FDAI2309,
    line: 500000,
    dust: 5000,
    dec: 18,
  },
}

const ilkUSDCFUSDC2309: Ilk = {
  baseId: USDC,
  ilkId: FUSDC2309,
  asset: {
    assetId: FUSDC2309,
    address: fCashAddress,
  },
  collateralization: {
    baseId: USDC,
    ilkId: FUSDC2309,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: FUSDC2309,
    line: 500000,
    dust: 5000,
    dec: 6,
  },
}

const fyETH2309 = series.getOrThrow(FYETH2309)!
const fyDAI2309 = series.getOrThrow(FYDAI2309)!
const fyUSDC2309 = series.getOrThrow(FYUSDC2309)!

/// @dev Newly accepted collaterals
export const newIlks: Array<[Series, Ilk]> = [
  [fyETH2309, ilkETHFETH2309],
  [fyDAI2309, ilkDAIFDAI2309],
  [fyUSDC2309, ilkUSDCFUSDC2309],
]

export const newJoins: Array<string> = [
  joins.getOrThrow(FETH2309)!,
  joins.getOrThrow(FDAI2309)!,
  joins.getOrThrow(FUSDC2309)!,
]
