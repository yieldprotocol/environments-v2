import { BigNumber } from 'ethers'
import { WAD, ONEUSDC, CHI, RATE } from '../../../../../shared/constants'
import { ACCUMULATOR, CHAINLINKUSD } from '../../../../../shared/constants'
import { ETH, DAI, USDC, USDT } from '../../../../../shared/constants'
import { FYUSDT2303, FYUSDT2306, YSUSDT6MMS, YSUSDT6MJD } from '../../../../../shared/constants'

import * as base_config from '../../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const deployers: Map<string, string> = base_config.deployers
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategyAddresses: Map<string, string> = base_config.strategyAddresses

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const protocol = () => readAddressMappingIfExists('protocol.json')

import { Accumulator, OracleSource, Base, Ilk, Series, Strategy } from '../../../confTypes'

export const ONEUSDT = ONEUSDC

// ----- ORACLES -----

/// @notice Configuration of the acummulator
/// @param Asset identifier (bytes6 tag)
/// @param Acummulator type (bytes6 tag)
/// @param start Initial value for the acummulator (18 decimal fixed point)
/// @param increasePerSecond Acummulator multiplier, per second (18 decimal fixed point)
export const accumulators: Accumulator[] = [
  {
    baseId: USDT,
    kind: RATE,
    startRate: WAD,
    perSecondRate: BigNumber.from('1000000001546067000'),
  },
  {
    baseId: USDT,
    kind: CHI,
    startRate: WAD,
    perSecondRate: WAD,
  },
]

/// @notice Sources that will be added to the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Address for the base asset
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the quote asset
/// @param Address for the chainlink aggregator
export const chainlinkSources: OracleSource[] = [
  {
    baseId: USDT,
    baseAddress: assets.getOrThrow(USDT)!,
    quoteId: '', // Quote is always USD
    quoteAddress: '',
    sourceAddress: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7',
  },
]

// ----- ASSETS, BASES, ILKS -----

const usdt: Base = {
  assetId: USDT,
  address: assets.getOrThrow(USDT)!,
  rateOracle: protocol().getOrThrow(ACCUMULATOR)!,
}

export const newBase = usdt

const ilkUSDTUSDT: Ilk = {
  baseId: USDT,
  ilkId: USDT,
  asset: {
    assetId: USDT,
    address: assets.getOrThrow(USDT)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: USDT,
    oracle: protocol().getOrThrow(CHAINLINKUSD)!,
    ratio: 1000000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: USDT,
    line: 100000000,
    dust: 0,
    dec: 6,
  },
  // No auction line and limit for USDT/USDT
}

const ilkUSDTETH: Ilk = {
  baseId: USDT,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: ETH,
    oracle: protocol().getOrThrow(CHAINLINKUSD)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: ETH,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: ETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(1000), // $10M
  },
}

const ilkUSDTDAI: Ilk = {
  baseId: USDT,
  ilkId: DAI,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: DAI,
    oracle: protocol().getOrThrow(CHAINLINKUSD)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: DAI,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: DAI,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1100000),
    max: WAD.mul(10000000),
  },
}

const ilkUSDTUSDC: Ilk = {
  baseId: USDT,
  ilkId: USDC,
  asset: {
    assetId: USDC,
    address: assets.getOrThrow(USDC)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: USDC,
    oracle: protocol().getOrThrow(CHAINLINKUSD)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: USDC,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: USDC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1100000),
    max: ONEUSDT.mul(10000000),
  },
}

export const newIlks: Ilk[] = [ilkUSDTUSDT, ilkUSDTETH, ilkUSDTDAI, ilkUSDTUSDC]

/// ----- SERIES -----

const fyUSDT2303: Series = {
  seriesId: FYUSDT2303,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2303,
    address: fyTokens.getOrThrow(FYUSDT2303)!,
  },
  chiOracle: protocol().getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2303,
    address: pools.getOrThrow(FYUSDT2303)!,
  },
  ilks: newIlks,
}

const fyUSDT2306: Series = {
  seriesId: FYUSDT2306,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2306,
    address: fyTokens.getOrThrow(FYUSDT2306)!,
  },
  chiOracle: protocol().getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2306,
    address: pools.getOrThrow(FYUSDT2306)!,
  },
  ilks: newIlks,
}

export const newSeries: Series[] = [fyUSDT2303, fyUSDT2306]

/// ----- STRATEGIES -----

const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
  initAmount: ONEUSDT.mul(100),
  seriesToInvest: fyUSDT2303,
}

const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  base: usdt,
  initAmount: ONEUSDT.mul(100),
  seriesToInvest: fyUSDT2306,
}

export const newStrategies: Strategy[] = [ysUSDT6MMS, ysUSDT6MJD]
