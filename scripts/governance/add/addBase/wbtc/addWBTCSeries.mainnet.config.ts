import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { WAD, ONEWBTC, CHI, RATE, ONEUSDC } from '../../../../../shared/constants'
import { ACCUMULATOR, CHAINLINK, COMPOSITE } from '../../../../../shared/constants'
import { ETH, DAI, FRAX, USDC, WBTC, LINK, STETH, WSTETH, RETH, ENS, UNI } from '../../../../../shared/constants'
import { FYWBTC2303, FYWBTC2306, YSWBTC6MMS, YSWBTC6MJD } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'
export const whales: Map<string, string> = base_config.whales

export const deployers: Map<string, string> = base_config.deployers
export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategyAddresses: Map<string, string> = base_config.strategyAddresses

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const protocol = () => readAddressMappingIfExists('protocol.json')

import { Accumulator, OracleSource, OraclePath, Base, Ilk, Series, Strategy } from '../../../confTypes'

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
    quoteId: ETH,
    quoteAddress: assets.getOrThrow(ETH),
    sourceAddress: '0xdeb288f737066589598e9214e782fa5a8ed689e8', // BTC/ETH
  },
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: OracleSource[] = [
  {
    baseId: WBTC,
    baseAddress: assets.getOrThrow(WBTC),
    quoteId: ETH,
    quoteAddress: assets.getOrThrow(ETH),
    sourceAddress: protocol().getOrThrow(CHAINLINK),
  },
]

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const compositePaths: OraclePath[] = [
  {
    baseId: WBTC,
    quoteId: ENS,
    path: [ETH],
  },
  {
    baseId: WBTC,
    quoteId: WSTETH,
    path: [ETH, STETH],
  },
  {
    baseId: WBTC,
    quoteId: RETH,
    path: [ETH],
  },
]

// ----- ASSETS, BASES, ILKS -----

const wbtcAsBase: Base = {
  assetId: WBTC,
  address: assets.getOrThrow(WBTC),
  rateOracle: protocol().getOrThrow(ACCUMULATOR),
}

export const newBase = wbtcAsBase

const ilkWBTC: Ilk = {
  baseId: WBTC,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: WBTC,
    oracle: protocol().getOrThrow(CHAINLINK),
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
    oracle: protocol().getOrThrow(CHAINLINK),
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
    max: WAD.mul(10000),
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
    oracle: protocol().getOrThrow(CHAINLINK),
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
    oracle: protocol().getOrThrow(CHAINLINK),
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
    max: ONEUSDC.mul(10000000),
  },
}

const ilkWBTCWSTETH: Ilk = {
  baseId: WBTC,
  ilkId: WSTETH,
  asset: {
    assetId: WSTETH,
    address: assets.getOrThrow(WSTETH),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: WSTETH,
    oracle: protocol().getOrThrow(COMPOSITE),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: WSTETH,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: WSTETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000),
  },
}

const ilkWBTCLINK: Ilk = {
  baseId: WBTC,
  ilkId: LINK,
  asset: {
    assetId: LINK,
    address: assets.getOrThrow(LINK),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: LINK,
    oracle: protocol().getOrThrow(CHAINLINK),
    ratio: 1670000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: LINK,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: LINK,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

const ilkWBTCUNI: Ilk = {
  baseId: WBTC,
  ilkId: UNI,
  asset: {
    assetId: UNI,
    address: assets.getOrThrow(UNI),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: UNI,
    oracle: protocol().getOrThrow(CHAINLINK),
    ratio: 1670000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: UNI,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: UNI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

const ilkWBTCENS: Ilk = {
  baseId: WBTC,
  ilkId: ENS,
  asset: {
    assetId: ENS,
    address: assets.getOrThrow(ENS),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: ENS,
    oracle: protocol().getOrThrow(COMPOSITE),
    ratio: 1670000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: ENS,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: ENS,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(10000),
  },
}

const ilkWBTCFRAX: Ilk = {
  baseId: WBTC,
  ilkId: FRAX,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: FRAX,
    oracle: protocol().getOrThrow(CHAINLINK),
    ratio: 1400000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: FRAX,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: FRAX,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000000),
  },
}

export const ilkWBTCRETH: Ilk = {
  baseId: WBTC,
  ilkId: RETH,
  asset: {
    assetId: RETH,
    address: assets.getOrThrow(RETH),
  },
  collateralization: {
    baseId: WBTC,
    ilkId: RETH,
    oracle: protocol().getOrThrow(COMPOSITE),
    ratio: 1670000,
  },
  debtLimits: {
    baseId: WBTC,
    ilkId: RETH,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: WBTC,
    ilkId: RETH,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62874251'), // 105 / 167
    max: parseUnits('1000'),
  },
}

export const newIlks: Ilk[] = [
  ilkWBTC,
  ilkWBTCETH,
  ilkWBTCDAI,
  ilkWBTCUSDC,
  ilkWBTCWSTETH,
  ilkWBTCRETH,
  ilkWBTCLINK,
  ilkWBTCUNI,
  ilkWBTCENS,
  ilkWBTCFRAX,
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
    address: pools.getOrThrow(FYWBTC2306)!,
  },
  ilks: newIlks,
}

export const newSeries: Series[] = [fyWBTC2303, fyWBTC2306]

/// ----- STRATEGIES -----

const ysWBTC6MMS: Strategy = {
  assetId: YSWBTC6MMS,
  address: strategyAddresses.getOrThrow(YSWBTC6MMS)!,
  base: wbtcAsBase,
  initAmount: ONEWBTC.mul(0.01),
  seriesToInvest: fyWBTC2303,
}

const ysWBTC6MJD: Strategy = {
  assetId: YSWBTC6MJD,
  address: strategyAddresses.getOrThrow(YSWBTC6MJD),
  base: wbtcAsBase,
  initAmount: ONEWBTC.mul(0.01),
  seriesToInvest: fyWBTC2306,
}

export const newStrategies: Strategy[] = [ysWBTC6MMS, ysWBTC6MJD]
