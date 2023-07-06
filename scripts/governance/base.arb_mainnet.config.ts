import { ethers } from 'ethers'
import { ETH, DAI, USDC, USDT } from '../../shared/constants'
import {
  FYETH2306,
  FYDAI2306,
  FYUSDC2306,
  FYUSDT2306,
  FYETH2309,
  FYDAI2309,
  FYUSDC2309,
  FYUSDT2309,
  FYETH2312,
  FYDAI2312,
  FYUSDC2312,
  FYUSDT2312,
} from '../../shared/constants'
import {
  YSETH6MJD,
  YSDAI6MJD,
  YSUSDC6MJD,
  YSUSDT6MJD,
  YSETH6MMS,
  YSDAI6MMS,
  YSUSDC6MMS,
  YSUSDT6MMS,
} from '../../shared/constants'
import { ACCUMULATOR, CHAINLINKUSD } from '../../shared/constants'
import { WAD, ONEUSDC } from '../../shared/constants'

import * as addresses from './addresses.mainnet.config'
export const external = addresses.external
export const assets = addresses.assets
export const protocol = addresses.protocol
export const governance = addresses.governance
export const deployers = addresses.deployers
export const fyTokens = addresses.fyTokens
export const pools = addresses.pools
export const joins = addresses.joins
export const strategyAddresses = addresses.strategies

export const chainId = 42161
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = new Map([
  [ETH, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [DAI, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [USDC, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
  [USDT, '0xBA12222222228d8Ba445958a75a0704d566BF2C8'],
])

import { Base, Ilk, Series, Strategy } from './confTypes'

export const ONEUSDT = ONEUSDC

const eth: Base = {
  assetId: ETH,
  address: assets.getOrThrow(ETH)!,
  rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
}

const dai: Base = {
  assetId: DAI,
  address: assets.getOrThrow(DAI)!,
  rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
}

const usdc: Base = {
  assetId: USDC,
  address: assets.getOrThrow(USDC)!,
  rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
}

const usdt: Base = {
  assetId: USDT,
  address: assets.getOrThrow(USDT)!,
  rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
}

export const bases: Map<string, Base> = new Map([
  [ETH, eth],
  [DAI, dai],
  [USDC, usdc],
  [USDT, usdt],
])

const ilkETHETH: Ilk = {
  baseId: ETH,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1000000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: ETH,
    line: 100000,
    dust: 0,
    dec: 18,
  },
  // No auction line and limit for ETH/ETH
}

const ilkETHDAI: Ilk = {
  baseId: ETH,
  ilkId: DAI,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: DAI,
    line: 100000,
    dust: 100,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: DAI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000000), // $10M
  },
}

const ilkETHUSDC: Ilk = {
  baseId: ETH,
  ilkId: USDC,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: USDC,
    line: 100000,
    dust: 100,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: USDC,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: ONEUSDC.mul(10000000), // $10M
  },
}

const ilkDAIDAI: Ilk = {
  baseId: DAI,
  ilkId: DAI,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1000000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: DAI,
    line: 100000,
    dust: 0,
    dec: 18,
  },
  // No auction line and limit for DAI/DAI
}

const ilkDAIETH: Ilk = {
  baseId: DAI,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: ETH,
    line: 100000,
    dust: 100,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: ETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000), // $10M
  },
}

const ilkDAIUSDC: Ilk = {
  baseId: DAI,
  ilkId: USDC,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: USDC,
    line: 100000,
    dust: 100,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: USDC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1100000),
    max: ONEUSDC.mul(10000000),
  },
}

const ilkUSDCUSDC: Ilk = {
  baseId: USDC,
  ilkId: USDC,
  asset: {
    assetId: USDC,
    address: assets.getOrThrow(USDC)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1000000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: USDC,
    line: 100000000,
    dust: 0,
    dec: 6,
  },
  // No auction line and limit for USDC/USDC
}

const ilkUSDCETH: Ilk = {
  baseId: USDC,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: ETH,
    line: 100000,
    dust: 100,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: ETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000), // $10M
  },
}

const ilkUSDCDAI: Ilk = {
  baseId: DAI,
  ilkId: USDC,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: DAI,
    line: 100000,
    dust: 100,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: DAI,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1100000),
    max: WAD.mul(10000000),
  },
}

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
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
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
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: ETH,
    line: 100000,
    dust: 100,
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
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: DAI,
    line: 100000,
    dust: 100,
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
    oracle: protocol.getOrThrow(CHAINLINKUSD)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: USDC,
    line: 100000,
    dust: 100,
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

export const ethIlks: Ilk[] = [ilkETHETH, ilkETHDAI, ilkETHUSDC]
export const daiIlks: Ilk[] = [ilkDAIDAI, ilkDAIETH, ilkDAIUSDC]
export const usdcIlks: Ilk[] = [ilkUSDCUSDC, ilkUSDCETH, ilkUSDCDAI]
export const usdtIlks: Ilk[] = [ilkUSDTUSDT, ilkUSDTETH, ilkUSDTDAI, ilkUSDTUSDC]
export const ilks: Map<string, Ilk[]> = new Map([
  [ETH, ethIlks],
  [DAI, daiIlks],
  [USDC, usdcIlks],
  [USDT, usdtIlks],
])

/// ----- STRATEGIES -----

export const fyETH2306: Series = {
  seriesId: FYETH2306,
  base: eth,
  fyToken: {
    assetId: FYETH2306,
    address: fyTokens.getOrThrow(FYETH2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2306,
    address: pools.getOrThrow(FYETH2306)!,
  },
  ilks: ethIlks,
}


export const fyDAI2306: Series = {
  seriesId: FYDAI2306,
  base: dai,
  fyToken: {
    assetId: FYDAI2306,
    address: fyTokens.getOrThrow(FYDAI2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2306,
    address: pools.getOrThrow(FYDAI2306)!,
  },
  ilks: daiIlks,
}

export const fyUSDC2306: Series = {
  seriesId: FYUSDC2306,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2306,
    address: fyTokens.getOrThrow(FYUSDC2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2306,
    address: pools.getOrThrow(FYUSDC2306)!,
  },
  ilks: usdcIlks,
}

export const fyUSDT2306: Series = {
  seriesId: FYUSDT2306,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2306,
    address: fyTokens.getOrThrow(FYUSDT2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2306,
    address: pools.getOrThrow(FYUSDT2306)!,
  },
  ilks: usdtIlks,
}

export const fyETH2309: Series = {
  seriesId: FYETH2309,
  base: eth,
  fyToken: {
    assetId: FYETH2309,
    address: fyTokens.getOrThrow(FYETH2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2309,
    address: pools.getOrThrow(FYETH2309)!,
  },
  ilks: ethIlks,
}

export const fyDAI2309: Series = {
  seriesId: FYDAI2309,
  base: dai,
  fyToken: {
    assetId: FYDAI2309,
    address: fyTokens.getOrThrow(FYDAI2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2309,
    address: pools.getOrThrow(FYDAI2309)!,
  },
  ilks: daiIlks,
}

export const fyUSDC2309: Series = {
  seriesId: FYUSDC2309,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2309,
    address: fyTokens.getOrThrow(FYUSDC2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2309,
    address: pools.getOrThrow(FYUSDC2309)!,
  },
  ilks: usdcIlks,
}

export const fyUSDT2309: Series = {
  seriesId: FYUSDT2309,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2309,
    address: fyTokens.getOrThrow(FYUSDT2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2309,
    address: pools.getOrThrow(FYUSDT2309)!,
  },
  ilks: usdtIlks,
}

export const fyETH2312: Series = {
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

export const fyDAI2312: Series = {
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

export const fyUSDC2312: Series = {
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

export const fyUSDT2312: Series = {
  seriesId: FYUSDT2312,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2312,
    address: fyTokens.getOrThrow(FYUSDT2312)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2312,
    address: pools.getOrThrow(FYUSDT2312)!,
  },
  ilks: usdtIlks,
}

export const series: Map<string, Series> = new Map([

  [FYETH2306, fyETH2306],
  [FYDAI2306, fyDAI2306],
  [FYUSDC2306, fyUSDC2306],
  [FYUSDT2306, fyUSDT2306],
  [FYETH2309, fyETH2309],
  [FYDAI2309, fyDAI2309],
  [FYUSDC2309, fyUSDC2309],
  [FYUSDT2309, fyUSDT2309],
  [FYETH2312, fyETH2312],
  [FYDAI2312, fyDAI2312],
  [FYUSDC2312, fyUSDC2312],
  [FYUSDT2312, fyUSDT2312],
])

/// ----- STRATEGIES -----

export const ysETH6MJD: Strategy = {
  assetId: YSETH6MJD,
  address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  base: eth,
  seriesToInvest: fyETH2312,
  initAmount: ethers.utils.parseUnits('0.1', 18),
}

export const ysDAI6MJD: Strategy = {
  assetId: YSDAI6MJD,
  address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  base: dai,
  seriesToInvest: fyDAI2312,
  initAmount: ethers.utils.parseUnits('100', 18),
}

export const ysUSDC6MJD: Strategy = {
  assetId: YSUSDC6MJD,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  base: usdc,
  seriesToInvest: fyUSDC2312,
  initAmount: ethers.utils.parseUnits('100', 6),
}

export const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  base: usdt,
  seriesToInvest: fyUSDT2312,
  initAmount: ethers.utils.parseUnits('50', 6),
}

export const ysETH6MMS: Strategy = {
  assetId: YSETH6MMS,
  address: strategyAddresses.getOrThrow(YSETH6MMS)!,
  base: eth,
  seriesToInvest: fyETH2309,
  initAmount: ethers.utils.parseUnits('0.1', 18),
}

export const ysDAI6MMS: Strategy = {
  assetId: YSDAI6MMS,
  address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  base: dai,
  seriesToInvest: fyDAI2309,
  initAmount: ethers.utils.parseUnits('100', 18),
}

export const ysUSDC6MMS: Strategy = {
  assetId: YSUSDC6MMS,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  base: usdc,
  seriesToInvest: fyUSDC2309,
  initAmount: ethers.utils.parseUnits('100', 6),
}

export const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
  seriesToInvest: fyUSDT2309,
  initAmount: ethers.utils.parseUnits('50', 6),
}

export const strategies: Map<string, Strategy> = new Map([
  [YSETH6MMS, ysETH6MMS],
  [YSETH6MJD, ysETH6MJD],
  [YSDAI6MMS, ysDAI6MMS],
  [YSDAI6MJD, ysDAI6MJD],
  [YSUSDC6MMS, ysUSDC6MMS],
  [YSUSDC6MJD, ysUSDC6MJD],
  [YSUSDT6MMS, ysUSDT6MMS],
  [YSUSDT6MJD, ysUSDT6MJD],
])
