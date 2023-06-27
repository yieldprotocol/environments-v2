import { readAddressMappingIfExists } from '../../shared/helpers'
import { ETH, DAI, USDC, USDT } from '../../shared/constants'
import {
  FYETH2303,
  FYETH2306,
  FYDAI2303,
  FYDAI2306,
  FYUSDC2303,
  FYUSDC2306,
  FYUSDT2303,
  FYUSDT2306,
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

export const external = readAddressMappingIfExists('external.json')
export const assets = readAddressMappingIfExists('assets.json')
export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const deployers = readAddressMappingIfExists('deployers.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const pools = readAddressMappingIfExists('pools.json')
export const joins = readAddressMappingIfExists('joins.json')
export const strategyAddresses = readAddressMappingIfExists('strategies.json') // TODO: Name clash :(

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

/// ----- SERIES -----

export const series: Map<string, Series> = new Map([])

/// ----- STRATEGIES -----

export const strategies: Map<string, Strategy> = new Map([])
