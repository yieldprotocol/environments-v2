import * as base_config from '../../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools

import { ETH, DAI, USDC, ACCUMULATOR, FCASH, NOTIONAL } from '../../../../../../shared/constants'
import { FDAI2312, FUSDC2312, FETH2312 } from '../../../../../../shared/constants'
import { FYDAI2312, FYUSDC2312, FYETH2312 } from '../../../../../../shared/constants'

import { Asset, OracleSource, Ilk, Series } from '../../../../confTypes'

/// @dev The address for fCash
export const fCashAddress = external.getOrThrow(FCASH)!


const eth = base_config.bases.get(ETH)!
const ethIlks = base_config.ilks.get(ETH)!
const dai = base_config.bases.get(DAI)!
const daiIlks = base_config.ilks.get(DAI)!
const usdc = base_config.bases.get(USDC)!
const usdcIlks = base_config.ilks.get(USDC)!

const fyETH2312: Series = {
  seriesId: FYETH2312,
  base: eth,
  fyToken: {
    assetId: FYETH2312,
    address: fyTokens.getOrThrow(FYETH2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2312,
    address: pools.getOrThrow(FYETH2312)!,
  },
  ilks: ethIlks,
}

const fyDAI2312: Series = {
  seriesId: FYDAI2312,
  base: dai,
  fyToken: {
    assetId: FYDAI2312,
    address: fyTokens.getOrThrow(FYDAI2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2312,
    address: pools.getOrThrow(FYDAI2312)!,
  },
  ilks: daiIlks,
}

const fyUSDC2312: Series = {
  seriesId: FYUSDC2312,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2312,
    address: fyTokens.getOrThrow(FYUSDC2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2312,
    address: pools.getOrThrow(FYUSDC2312)!,
  },
  ilks: usdcIlks,
}

export const series: Series[] = [fyETH2312, fyDAI2312, fyUSDC2312]

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
]

// ----- ASSETS, BASES, ILKS -----

const fETH2312: Asset = {
  assetId: FETH2312,
  address: fCashAddress,
}

const fDAI2312: Asset = {
  assetId: FDAI2312,
  address: fCashAddress,
}

const fUSDC2312: Asset = {
  assetId: FUSDC2312,
  address: fCashAddress,
}

export const newAssets = [fETH2312, fDAI2312, fUSDC2312]

const ilkETHFETH2312: Ilk = {
  baseId: ETH,
  ilkId: FETH2312,
  asset: {
    assetId: FETH2312,
    address: fCashAddress,
  },
  collateralization: {
    baseId: ETH,
    ilkId: FETH2312,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: FETH2312,
    line: 400,
    dust: 1,
    dec: 18,
  },
}

const ilkDAIFDAI2312: Ilk = {
  baseId: DAI,
  ilkId: FDAI2312,
  asset: {
    assetId: FDAI2312,
    address: fCashAddress,
  },
  collateralization: {
    baseId: DAI,
    ilkId: FDAI2312,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: FDAI2312,
    line: 500000,
    dust: 5000,
    dec: 18,
  },
}

const ilkUSDCFUSDC2312: Ilk = {
  baseId: USDC,
  ilkId: FUSDC2312,
  asset: {
    assetId: FUSDC2312,
    address: fCashAddress,
  },
  collateralization: {
    baseId: USDC,
    ilkId: FUSDC2312,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: FUSDC2312,
    line: 500000,
    dust: 5000,
    dec: 6,
  },
}

/// @dev Newly accepted collaterals
export const newIlks: Array<[Series, Ilk]> = [
  [fyETH2312, ilkETHFETH2312],
  [fyDAI2312, ilkDAIFDAI2312],
  [fyUSDC2312, ilkUSDCFUSDC2312],
]

export const newJoins: Array<string> = [
  joins.getOrThrow(FETH2312)!,
  joins.getOrThrow(FDAI2312)!,
  joins.getOrThrow(FUSDC2312)!,
]
