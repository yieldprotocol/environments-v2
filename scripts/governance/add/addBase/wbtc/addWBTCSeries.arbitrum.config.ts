import { BigNumber } from 'ethers'
import { WAD, CHI, RATE, USDT } from '../../../../../shared/constants'
import { ACCUMULATOR, CHAINLINKUSD } from '../../../../../shared/constants'
import { ETH, DAI, USDC, WBTC, ONEWBTC } from '../../../../../shared/constants'
import { FYWBTC2303, FYWBTC2306, YSWBTC6MMS, YSWBTC6MJD } from '../../../../../shared/constants'

import * as base_config from '../../../base.arb_mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'
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

// ----- ORACLES -----

/// @notice Configuration of the acummulator
/// @param Asset identifier (bytes6 tag)
/// @param Acummulator type (bytes6 tag)
/// @param start Initial value for the acummulator (18 decimal fixed point)
/// @param increasePerSecond Acummulator multiplier, per second (18 decimal fixed point)
export const accumulators: Accumulator[] = [
  {
    baseId: WBTC,
    kind: RATE,
    startRate: WAD,
    perSecondRate: BigNumber.from('1000000001546067000'),
  },
  {
    baseId: WBTC,
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
    baseId: WBTC,
    baseAddress: assets.getOrThrow(WBTC),
    quoteId: '', // Quote is always USD
    quoteAddress: '',
    sourceAddress: '0xd0c7101eacbb49f3decccc166d238410d6d46d57',
  },
]

// ----- ASSETS, BASES, ILKS -----

const wbtcAsBase: Base = {
  assetId: WBTC,
  address: assets.getOrThrow(WBTC),
  rateOracle: protocol().getOrThrow(ACCUMULATOR),
}

export const newBase = wbtcAsBase

const ilkWBTCWBTC: Ilk = {
  baseId: WBTC,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: WBTC,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1000000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: WBTC,
    line: 100000000,
    dust: 0,
    dec: 6,
  },
  // No auction line and limit for WBTC/WBTC
}

const ilkWBTCETH: Ilk = {
  baseId: WBTC,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: ETH,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: ETH,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: ETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(1000), // $10M
  },
}

const ilkWBTCDAI: Ilk = {
  baseId: WBTC,
  ilkId: DAI,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: DAI,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: DAI,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: DAI,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000000),
  },
}

const ilkWBTCUSDC: Ilk = {
  baseId: WBTC,
  ilkId: USDC,
  asset: {
    assetId: USDC,
    address: assets.getOrThrow(USDC),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: USDC,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: USDC,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: USDC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: ONEWBTC.mul(10000000),
  },
}

// WBTC as collateral
const ilkDAIWBTC: Ilk = {
  baseId: DAI,
  ilkId: WBTC,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI),
  },
  collateralization: {
    baseId: DAI,
    ilkId: WBTC,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: WBTC,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: WBTC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: ONEWBTC.mul(10000000),
  },
}

const ilkETHWBTC: Ilk = {
  baseId: ETH,
  ilkId: WBTC,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH),
  },
  collateralization: {
    baseId: ETH,
    ilkId: WBTC,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: WBTC,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: WBTC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: ONEWBTC.mul(10000000),
  },
}

const ilkUSDCWBTC: Ilk = {
  baseId: USDC,
  ilkId: WBTC,
  asset: {
    assetId: USDC,
    address: assets.getOrThrow(USDC),
  },
  collateralization: {
    baseId: USDC,
    ilkId: WBTC,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: WBTC,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: WBTC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: ONEWBTC.mul(10000000),
  },
}

const ilkUSDTWBTC: Ilk = {
  baseId: USDT,
  ilkId: WBTC,
  asset: {
    assetId: USDT,
    address: assets.getOrThrow(USDT),
  },
  collateralization: {
    baseId: USDT,
    ilkId: WBTC,
    oracle: protocol().getOrThrow(CHAINLINKUSD),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: WBTC,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: WBTC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: ONEWBTC.mul(10000000),
  },
}

export const newIlks: Ilk[] = [
  ilkWBTCWBTC,
  ilkWBTCETH,
  ilkWBTCDAI,
  ilkWBTCUSDC,
  ilkDAIWBTC,
  ilkETHWBTC,
  ilkUSDCWBTC,
  ilkUSDTWBTC,
]

/// ----- SERIES -----

const fyWBTC2303: Series = {
  seriesId: FYWBTC2303,
  base: wbtcAsBase,
  fyToken: {
    assetId: FYWBTC2303,
    address: fyTokens.getOrThrow(FYWBTC2303),
  },
  chiOracle: protocol().getOrThrow(ACCUMULATOR),
  pool: {
    assetId: FYWBTC2303,
    address: pools.getOrThrow(FYWBTC2303),
  },
  ilks: newIlks,
}

const fyWBTC2306: Series = {
  seriesId: FYWBTC2306,
  base: wbtcAsBase,
  fyToken: {
    assetId: FYWBTC2306,
    address: fyTokens.getOrThrow(FYWBTC2306),
  },
  chiOracle: protocol().getOrThrow(ACCUMULATOR),
  pool: {
    assetId: FYWBTC2306,
    address: pools.getOrThrow(FYWBTC2306),
  },
  ilks: newIlks,
}

export const newSeries: Series[] = [fyWBTC2303, fyWBTC2306]

/// ----- STRATEGIES -----

const ysWBTC6MMS: Strategy = {
  assetId: YSWBTC6MMS,
  address: strategyAddresses.getOrThrow(YSWBTC6MMS),
  base: wbtcAsBase,
  initAmount: ONEWBTC.mul(100),
  seriesToInvest: fyWBTC2303,
}

const ysWBTC6MJD: Strategy = {
  assetId: YSWBTC6MJD,
  address: strategyAddresses.getOrThrow(YSWBTC6MJD),
  base: wbtcAsBase,
  initAmount: ONEWBTC.mul(100),
  seriesToInvest: fyWBTC2306,
}

export const newStrategies: Strategy[] = [ysWBTC6MMS, ysWBTC6MJD]
