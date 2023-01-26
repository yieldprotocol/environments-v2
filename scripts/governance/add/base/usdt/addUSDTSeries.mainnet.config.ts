import { BigNumber } from 'ethers'
import { WAD, ONEUSDC, ONEWBTC, CHI, RATE } from '../../../../../shared/constants'
import { ACCUMULATOR, CHAINLINK, COMPOSITE } from '../../../../../shared/constants'
import { ETH, DAI, FRAX, USDC, WBTC, LINK, STETH, WSTETH, ENS, UNI, USDT } from '../../../../../shared/constants'
import { FYUSDT2303, FYUSDT2306, YSUSDT6MMS, YSUSDT6MJD } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const whales: Map<string, string> = base_config.whales

export const deployers: Map<string, string> = base_config.deployers
export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategies: Map<string, string> = base_config.strategies

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const protocol = () => readAddressMappingIfExists('protocol.json')

import { Accumulator, OracleSource, OraclePath, Asset, Base, Ilk, Series, Strategy } from '../../../confTypes'

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
    quoteId: ETH,
    quoteAddress: assets.getOrThrow(ETH)!,
    sourceAddress: '0x14d04Fff8D21bd62987a5cE9ce543d2F1edF5D3E',
  },
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: OracleSource[] = [
  {
    baseId: USDT,
    baseAddress: '', // TODO: Is this the best way of ignoring this?
    quoteId: ETH,
    quoteAddress: '',
    sourceAddress: protocol().getOrThrow(CHAINLINK)!,
  },
]

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const compositePaths: OraclePath[] = [
  {
    baseId: USDT,
    quoteId: ENS,
    path: [ETH],
  },
  {
    baseId: USDT,
    quoteId: WSTETH,
    path: [ETH, STETH],
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
    oracle: protocol().getOrThrow(CHAINLINK)!,
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
    oracle: protocol().getOrThrow(CHAINLINK)!,
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
    oracle: protocol().getOrThrow(CHAINLINK)!,
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
    oracle: protocol().getOrThrow(CHAINLINK)!,
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

const ilkUSDTWBTC: Ilk = {
  baseId: USDT,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: WBTC,
    oracle: protocol().getOrThrow(CHAINLINK)!,
    ratio: 1500000,
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
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1500000),
    max: ONEWBTC.mul(1000),
  },
}

const ilkUSDTWSTETH: Ilk = {
  baseId: USDT,
  ilkId: WSTETH,
  asset: {
    assetId: WSTETH,
    address: assets.getOrThrow(WSTETH)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: WSTETH,
    oracle: protocol().getOrThrow(COMPOSITE)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: WSTETH,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: WSTETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000),
  },
}

const ilkUSDTLINK: Ilk = {
  baseId: USDT,
  ilkId: LINK,
  asset: {
    assetId: LINK,
    address: assets.getOrThrow(LINK)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: LINK,
    oracle: protocol().getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: LINK,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: LINK,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

const ilkUSDTUNI: Ilk = {
  baseId: USDT,
  ilkId: UNI,
  asset: {
    assetId: UNI,
    address: assets.getOrThrow(UNI)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: UNI,
    oracle: protocol().getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: UNI,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: UNI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

const ilkUSDTENS: Ilk = {
  baseId: USDT,
  ilkId: ENS,
  asset: {
    assetId: ENS,
    address: assets.getOrThrow(ENS)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: ENS,
    oracle: protocol().getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: ENS,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: ENS,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(10000),
  },
}

const ilkUSDTFRAX: Ilk = {
  baseId: USDT,
  ilkId: FRAX,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: FRAX,
    oracle: protocol().getOrThrow(CHAINLINK)!,
    ratio: 1150000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: FRAX,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: FRAX,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilks: Ilk[] = [
  ilkUSDTUSDT,
  ilkUSDTETH,
  ilkUSDTDAI,
  ilkUSDTUSDC,
  ilkUSDTWBTC,
  ilkUSDTWSTETH,
  ilkUSDTLINK,
  ilkUSDTUNI,
  ilkUSDTENS,
  ilkUSDTFRAX,
]

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
  ilks: ilks,
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
  ilks: ilks,
}

export const newSeries: Series[] = [fyUSDT2303, fyUSDT2306]

/// ----- STRATEGIES -----

const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategies.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
  initAmount: ONEUSDT.mul(100),
  seriesToInvest: fyUSDT2303,
}

const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategies.getOrThrow(YSUSDT6MJD)!,
  base: usdt,
  initAmount: ONEUSDT.mul(100),
  seriesToInvest: fyUSDT2306,
}

export const newStrategies: Strategy[] = [ysUSDT6MMS, ysUSDT6MJD]
