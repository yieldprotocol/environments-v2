import { ethers } from 'hardhat'
import { parseUnits } from 'ethers/lib/utils'
import {
  DAI,
  ENS,
  ETH,
  FRAX,
  LINK,
  UNI,
  USDC,
  WBTC,
  WSTETH,
  CRAB,
  YVUSDC,
  USDT,
  RETH,
  NOTIONAL,
  FCASH,
  FETH2303,
  FDAI2303,
  FUSDC2303,
  FETH2306,
  FDAI2306,
  FUSDC2306,
  FETH2309,
  FDAI2309,
  FUSDC2309,
  FETH2312,
  FDAI2312,
  FUSDC2312,
} from '../../shared/constants'
import {
  FYETH2303,
  FYDAI2303,
  FYUSDC2303,
  FYFRAX2303,
  FYUSDT2303,
  FYETH2306,
  FYDAI2306,
  FYUSDC2306,
  FYFRAX2306,
  FYUSDT2306,
  FYETH2306B,
  FYDAI2306B,
  FYUSDC2306B,
  FYUSDT2306B,
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
  YSFRAX6MJD,
  YSUSDT6MJD,
  YSETH6MMS,
  YSDAI6MMS,
  YSUSDC6MMS,
  YSFRAX6MMS,
  YSUSDT6MMS,
} from '../../shared/constants'
import {
  ACCUMULATOR,
  COMPOUND,
  CHAINLINK,
  COMPOSITE,
  YEARN,
  LIDO,
  RETH_ORACLE,
  CRAB_ORACLE,
} from '../../shared/constants'
import { WAD, ONEUSDC, ONEWBTC } from '../../shared/constants'

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

export const chainId = 1

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const fCashAddress = external.getOrThrow(FCASH)!

import { Asset, Base, Ilk, Series, Strategy } from './confTypes'

export const ONEUSDT = ONEUSDC

export const eth: Base = {
  assetId: ETH,
  address: assets.getOrThrow(ETH)!,
  rateOracle: protocol.getOrThrow(COMPOUND)!,
}

export const dai: Base = {
  assetId: DAI,
  address: assets.getOrThrow(DAI)!,
  rateOracle: protocol.getOrThrow(COMPOUND)!,
}

export const usdc: Base = {
  assetId: USDC,
  address: assets.getOrThrow(USDC)!,
  rateOracle: protocol.getOrThrow(COMPOUND)!,
}

export const frax: Base = {
  assetId: FRAX,
  address: assets.getOrThrow(FRAX)!,
  rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
}

export const usdt: Base = {
  assetId: USDT,
  address: assets.getOrThrow(USDT)!,
  rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
}

export const reth: Asset = {
  assetId: RETH,
  address: assets.getOrThrow(RETH)!,
}

export const crab: Asset = {
  assetId: CRAB,
  address: assets.getOrThrow(CRAB)!,
}

export const fETH2309: Asset = {
  assetId: FETH2309,
  address: fCashAddress,
}

export const fDAI2309: Asset = {
  assetId: FDAI2309,
  address: fCashAddress,
}

export const fUSDC2309: Asset = {
  assetId: FUSDC2309,
  address: fCashAddress,
}

export const fETH2312: Asset = {
  assetId: FETH2312,
  address: fCashAddress,
}

export const fDAI2312: Asset = {
  assetId: FDAI2312,
  address: fCashAddress,
}

export const fUSDC2312: Asset = {
  assetId: FUSDC2312,
  address: fCashAddress,
}

export const bases: Map<string, Base> = new Map([
  [ETH, eth],
  [DAI, dai],
  [USDC, usdc],
  [FRAX, frax],
  [USDT, usdt],
])

/// -------------------------------- ETH --------------------------------

export const ilkETHETH: Ilk = {
  baseId: ETH,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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

export const ilkETHDAI: Ilk = {
  baseId: ETH,
  ilkId: DAI,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: DAI,
    line: 100000,
    dust: 1000,
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

export const ilkETHUSDC: Ilk = {
  baseId: ETH,
  ilkId: USDC,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: USDC,
    line: 100000,
    dust: 1000,
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

export const ilkETHWBTC: Ilk = {
  baseId: ETH,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: WBTC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1500000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: WBTC,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: WBTC,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1500000),
    max: ONEWBTC.mul(1000),
  },
}

export const ilkETHWSTETH: Ilk = {
  baseId: ETH,
  ilkId: WSTETH,
  asset: {
    assetId: WSTETH,
    address: assets.getOrThrow(WSTETH)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: WSTETH,
    oracle: protocol.getOrThrow(LIDO)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: WSTETH,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: WSTETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000),
  },
}

export const ilkETHLINK: Ilk = {
  baseId: ETH,
  ilkId: LINK,
  asset: {
    assetId: LINK,
    address: assets.getOrThrow(LINK)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: LINK,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: LINK,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: LINK,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkETHUNI: Ilk = {
  baseId: ETH,
  ilkId: UNI,
  asset: {
    assetId: UNI,
    address: assets.getOrThrow(UNI)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: UNI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: UNI,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: UNI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkETHENS: Ilk = {
  baseId: ETH,
  ilkId: ENS,
  asset: {
    assetId: ENS,
    address: assets.getOrThrow(ENS)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: ENS,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: ENS,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: ENS,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(10000),
  },
}

export const ilkETHFRAX: Ilk = {
  baseId: ETH,
  ilkId: FRAX,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX)!,
  },
  collateralization: {
    baseId: ETH,
    ilkId: FRAX,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1150000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: FRAX,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: FRAX,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkETHRETH: Ilk = {
  baseId: ETH,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: ETH,
    ilkId: reth.assetId,
    oracle: protocol.getOrThrow(RETH_ORACLE)!,
    ratio: 1330000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: reth.assetId,
    line: 150,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: reth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.78947368'), // 105 / 133
    max: parseUnits('1000'),
  },
}

export const ilkETHCRAB: Ilk = {
  baseId: ETH,
  ilkId: crab.assetId,
  asset: crab,
  collateralization: {
    baseId: ETH,
    ilkId: crab.assetId,
    oracle: protocol.getOrThrow(CRAB_ORACLE)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: crab.assetId,
    line: 250,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: CRAB,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.78571429'), // 110 / 140
    max: parseUnits('1000'),
  },
}

export const ilkETHFETH2303: Ilk = {
  baseId: ETH,
  ilkId: FETH2303,
  asset: { assetId: FETH2303, address: assets.getOrThrow(FETH2303)! },
  collateralization: {
    baseId: ETH,
    ilkId: FETH2303,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: FETH2303,
    line: 400,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: FETH2303,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkETHFETH2306: Ilk = {
  baseId: ETH,
  ilkId: FETH2306,
  asset: { assetId: FETH2306, address: assets.getOrThrow(FETH2306)! },
  collateralization: {
    baseId: ETH,
    ilkId: FETH2306,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: FETH2306,
    line: 400,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: FETH2306,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkETHFETH2309: Ilk = {
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

export const ilkETHFETH2312: Ilk = {
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

/// ---------------------------- DAI ----------------------------

export const ilkDAIDAI: Ilk = {
  baseId: DAI,
  ilkId: DAI,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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

export const ilkDAIETH: Ilk = {
  baseId: DAI,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: ETH,
    line: 100000,
    dust: 1000,
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

export const ilkDAIUSDC: Ilk = {
  baseId: DAI,
  ilkId: USDC,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: USDC,
    line: 100000,
    dust: 1000,
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

export const ilkDAIWBTC: Ilk = {
  baseId: DAI,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: WBTC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1500000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: WBTC,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: WBTC,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1500000),
    max: ONEWBTC.mul(1000),
  },
}

export const ilkDAIWSTETH: Ilk = {
  baseId: DAI,
  ilkId: WSTETH,
  asset: {
    assetId: WSTETH,
    address: assets.getOrThrow(WSTETH)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: WSTETH,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: WSTETH,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: WSTETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000),
  },
}

export const ilkDAILINK: Ilk = {
  baseId: DAI,
  ilkId: LINK,
  asset: {
    assetId: LINK,
    address: assets.getOrThrow(LINK)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: LINK,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: LINK,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: LINK,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkDAIUNI: Ilk = {
  baseId: DAI,
  ilkId: UNI,
  asset: {
    assetId: UNI,
    address: assets.getOrThrow(UNI)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: UNI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: UNI,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: UNI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkDAIENS: Ilk = {
  baseId: DAI,
  ilkId: ENS,
  asset: {
    assetId: ENS,
    address: assets.getOrThrow(ENS)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: ENS,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: ENS,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: ENS,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(10000),
  },
}

export const ilkDAIFRAX: Ilk = {
  baseId: DAI,
  ilkId: FRAX,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: FRAX,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1150000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: FRAX,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: FRAX,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkDAIRETH: Ilk = {
  baseId: DAI,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: DAI,
    ilkId: reth.assetId,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: reth.assetId,
    line: 250000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: reth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62874251'), // 105 / 167
    max: parseUnits('1000'),
  },
}

export const ilkDAICRAB: Ilk = {
  baseId: DAI,
  ilkId: crab.assetId,
  asset: crab,
  collateralization: {
    baseId: DAI,
    ilkId: crab.assetId,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1330000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: crab.assetId,
    line: 250000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: CRAB,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.82706767'), // 110 / 133
    max: parseUnits('1000'),
  },
}

export const ilkDAIFDAI2303: Ilk = {
  baseId: DAI,
  ilkId: FDAI2303,
  asset: {
    assetId: FDAI2303,
    address: assets.getOrThrow(FDAI2303)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: FDAI2303,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: FDAI2303,
    line: 1000000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: FDAI2303,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}
export const ilkDAIFDAI2306: Ilk = {
  baseId: DAI,
  ilkId: FDAI2306,
  asset: {
    assetId: FDAI2306,
    address: assets.getOrThrow(FDAI2306)!,
  },
  collateralization: {
    baseId: DAI,
    ilkId: FDAI2306,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: FDAI2306,
    line: 1000000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: FDAI2306,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkDAIFDAI2309: Ilk = {
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

export const ilkDAIFDAI2312: Ilk = {
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

/// ---------------------------- USDC ----------------------------

export const ilkUSDCUSDC: Ilk = {
  baseId: USDC,
  ilkId: USDC,
  asset: {
    assetId: USDC,
    address: assets.getOrThrow(USDC)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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

export const ilkUSDCETH: Ilk = {
  baseId: USDC,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: ETH,
    line: 100000,
    dust: 1000,
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

export const ilkUSDCDAI: Ilk = {
  baseId: USDC,
  ilkId: DAI,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: DAI,
    line: 100000,
    dust: 1000,
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

export const ilkUSDCWBTC: Ilk = {
  baseId: USDC,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: WBTC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1500000,
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
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1500000),
    max: ONEWBTC.mul(1000),
  },
}

export const ilkUSDCWSTETH: Ilk = {
  baseId: USDC,
  ilkId: WSTETH,
  asset: {
    assetId: WSTETH,
    address: assets.getOrThrow(WSTETH)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: WSTETH,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: WSTETH,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: WSTETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000),
  },
}

export const ilkUSDCLINK: Ilk = {
  baseId: USDC,
  ilkId: LINK,
  asset: {
    assetId: LINK,
    address: assets.getOrThrow(LINK)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: LINK,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: LINK,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: LINK,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkUSDCUNI: Ilk = {
  baseId: USDC,
  ilkId: UNI,
  asset: {
    assetId: UNI,
    address: assets.getOrThrow(UNI)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: UNI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: UNI,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: UNI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkUSDCENS: Ilk = {
  baseId: USDC,
  ilkId: ENS,
  asset: {
    assetId: ENS,
    address: assets.getOrThrow(ENS)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: ENS,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: ENS,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: ENS,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(10000),
  },
}

export const ilkUSDCFRAX: Ilk = {
  baseId: USDC,
  ilkId: FRAX,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: FRAX,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1150000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: FRAX,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: FRAX,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkUSDCYVUSDC: Ilk = {
  baseId: USDC,
  ilkId: YVUSDC,
  asset: {
    assetId: YVUSDC,
    address: assets.getOrThrow(YVUSDC)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: YVUSDC,
    oracle: protocol.getOrThrow(YEARN)!,
    ratio: 1150000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: YVUSDC,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: YVUSDC,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkUSDCRETH: Ilk = {
  baseId: USDC,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: USDC,
    ilkId: reth.assetId,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: reth.assetId,
    line: 250000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: reth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62874251'), // 105 / 167
    max: parseUnits('1000'),
  },
}

export const ilkUSDCCRAB: Ilk = {
  baseId: USDC,
  ilkId: crab.assetId,
  asset: crab,
  collateralization: {
    baseId: USDC,
    ilkId: crab.assetId,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1330000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: crab.assetId,
    line: 250000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: CRAB,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.82706767'), // 110 / 133
    max: parseUnits('1000'),
  },
}

export const ilkUSDCFUSDC2303: Ilk = {
  baseId: USDC,
  ilkId: FUSDC2303,
  asset: {
    assetId: FUSDC2303,
    address: assets.getOrThrow(FUSDC2303)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: FUSDC2303,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: FUSDC2303,
    line: 1000000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: FUSDC2303,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkUSDCFUSDC2306: Ilk = {
  baseId: USDC,
  ilkId: FUSDC2306,
  asset: {
    assetId: FUSDC2306,
    address: assets.getOrThrow(FUSDC2306)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: FUSDC2306,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: FUSDC2306,
    line: 1000000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: FUSDC2306,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkUSDCFUSDC2309: Ilk = {
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

export const ilkUSDCFUSDC2312: Ilk = {
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
/// ---------------------------- FRAX ----------------------------

export const ilkFRAXFRAX: Ilk = {
  baseId: FRAX,
  ilkId: FRAX,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: FRAX,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1000000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: FRAX,
    line: 100000,
    dust: 0,
    dec: 18,
  },
  // No auction line and limit for FRAX/FRAX
}

export const ilkFRAXETH: Ilk = {
  baseId: FRAX,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: ETH,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: ETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000), // $10M
  },
}

export const ilkFRAXDAI: Ilk = {
  baseId: FRAX,
  ilkId: DAI,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1150000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: DAI,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: DAI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1150000),
    max: WAD.mul(10000000),
  },
}

export const ilkFRAXUSDC: Ilk = {
  baseId: FRAX,
  ilkId: USDC,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: USDC,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: USDC,
    duration: 3600,
    vaultProportion: WAD,
    collateralProportion: WAD.mul(1050000).div(1100000),
    max: ONEUSDC.mul(10000000),
  },
}

export const ilkFRAXWBTC: Ilk = {
  baseId: FRAX,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: WBTC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1500000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: WBTC,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: WBTC,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1500000),
    max: ONEWBTC.mul(1000),
  },
}

export const ilkFRAXWSTETH: Ilk = {
  baseId: FRAX,
  ilkId: WSTETH,
  asset: {
    assetId: WSTETH,
    address: assets.getOrThrow(WSTETH)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: WSTETH,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: WSTETH,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: WSTETH,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1400000),
    max: WAD.mul(10000),
  },
}

export const ilkFRAXLINK: Ilk = {
  baseId: FRAX,
  ilkId: LINK,
  asset: {
    assetId: LINK,
    address: assets.getOrThrow(LINK)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: LINK,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: LINK,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: LINK,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkFRAXUNI: Ilk = {
  baseId: FRAX,
  ilkId: UNI,
  asset: {
    assetId: UNI,
    address: assets.getOrThrow(UNI)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: UNI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: UNI,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: UNI,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(100000),
  },
}

export const ilkFRAXENS: Ilk = {
  baseId: FRAX,
  ilkId: ENS,
  asset: {
    assetId: ENS,
    address: assets.getOrThrow(ENS)!,
  },
  collateralization: {
    baseId: FRAX,
    ilkId: ENS,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: ENS,
    line: 100000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: ENS,
    duration: 3600,
    vaultProportion: WAD.div(2),
    collateralProportion: WAD.mul(1050000).div(1670000),
    max: WAD.mul(10000),
  },
}

export const ilkFRAXRETH: Ilk = {
  baseId: FRAX,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: FRAX,
    ilkId: reth.assetId,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: FRAX,
    ilkId: reth.assetId,
    line: 250000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: FRAX,
    ilkId: reth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62874251'), // 105 / 167
    max: parseUnits('1000'),
  },
}

/// ---------------------------- USDT ----------------------------

export const ilkUSDTUSDT: Ilk = {
  baseId: USDT,
  ilkId: USDT,
  asset: {
    assetId: USDT,
    address: assets.getOrThrow(USDT)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: USDT,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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

export const ilkUSDTETH: Ilk = {
  baseId: USDT,
  ilkId: ETH,
  asset: {
    assetId: ETH,
    address: assets.getOrThrow(ETH)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: ETH,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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

export const ilkUSDTDAI: Ilk = {
  baseId: USDT,
  ilkId: DAI,
  asset: {
    assetId: DAI,
    address: assets.getOrThrow(DAI)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: DAI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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
export const ilkUSDTUSDC: Ilk = {
  baseId: USDT,
  ilkId: USDC,
  asset: {
    assetId: USDC,
    address: assets.getOrThrow(USDC)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: USDC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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
export const ilkUSDTWBTC: Ilk = {
  baseId: USDT,
  ilkId: WBTC,
  asset: {
    assetId: WBTC,
    address: assets.getOrThrow(WBTC)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: WBTC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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
export const ilkUSDTWSTETH: Ilk = {
  baseId: USDT,
  ilkId: WSTETH,
  asset: {
    assetId: WSTETH,
    address: assets.getOrThrow(WSTETH)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: WSTETH,
    oracle: protocol.getOrThrow(COMPOSITE)!,
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
export const ilkUSDTLINK: Ilk = {
  baseId: USDT,
  ilkId: LINK,
  asset: {
    assetId: LINK,
    address: assets.getOrThrow(LINK)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: LINK,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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
export const ilkUSDTUNI: Ilk = {
  baseId: USDT,
  ilkId: UNI,
  asset: {
    assetId: UNI,
    address: assets.getOrThrow(UNI)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: UNI,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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
export const ilkUSDTENS: Ilk = {
  baseId: USDT,
  ilkId: ENS,
  asset: {
    assetId: ENS,
    address: assets.getOrThrow(ENS)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: ENS,
    oracle: protocol.getOrThrow(COMPOSITE)!,
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
export const ilkUSDTFRAX: Ilk = {
  baseId: USDT,
  ilkId: FRAX,
  asset: {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX)!,
  },
  collateralization: {
    baseId: USDT,
    ilkId: FRAX,
    oracle: protocol.getOrThrow(CHAINLINK)!,
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

export const ilkUSDTRETH: Ilk = {
  baseId: USDT,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: USDT,
    ilkId: reth.assetId,
    oracle: protocol.getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDT,
    ilkId: reth.assetId,
    line: 100000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDT,
    ilkId: reth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.62874251'), // 105 / 167
    max: parseUnits('1000'),
  },
}

export const ethIlks: Ilk[] = [
  ilkETHETH,
  ilkETHDAI,
  ilkETHUSDC,
  ilkETHWBTC,
  ilkETHWSTETH,
  ilkETHLINK,
  ilkETHUNI,
  ilkETHENS,
  ilkETHFRAX,
  ilkETHRETH,
  ilkETHCRAB,
]

export const ethIlks2306: Ilk[] = [...ethIlks, ilkETHFETH2306]
export const ethIlks2309: Ilk[] = [...ethIlks, ilkETHFETH2309]
export const ethIlks2312: Ilk[] = [...ethIlks, ilkETHFETH2312]

export const daiIlks: Ilk[] = [
  ilkDAIETH,
  ilkDAIDAI,
  ilkDAIUSDC,
  ilkDAIWBTC,
  ilkDAIWSTETH,
  ilkDAILINK,
  ilkDAIUNI,
  ilkDAIENS,
  ilkDAIFRAX,
  ilkDAIRETH,
  ilkDAICRAB,
]

export const daiIlks2306: Ilk[] = [...daiIlks, ilkDAIFDAI2306]
export const daiIlks2309: Ilk[] = [...daiIlks, ilkDAIFDAI2309]
export const daiIlks2312: Ilk[] = [...daiIlks, ilkDAIFDAI2312]

export const usdcIlks: Ilk[] = [
  ilkUSDCETH,
  ilkUSDCDAI,
  ilkUSDCUSDC,
  ilkUSDCWBTC,
  ilkUSDCWSTETH,
  ilkUSDCLINK,
  ilkUSDCUNI,
  ilkUSDCENS,
  ilkUSDCFRAX,
  ilkUSDCRETH,
  ilkUSDCCRAB,
  ilkUSDCFUSDC2306,
]

export const usdcIlks2306: Ilk[] = [...usdcIlks, ilkUSDCFUSDC2306]
export const usdcIlks2309: Ilk[] = [...usdcIlks, ilkUSDCFUSDC2309]
export const usdcIlks2312: Ilk[] = [...usdcIlks, ilkUSDCFUSDC2312]

export const fraxIlks: Ilk[] = [
  ilkFRAXETH,
  ilkFRAXDAI,
  ilkFRAXUSDC,
  ilkFRAXWBTC,
  ilkFRAXWSTETH,
  ilkFRAXLINK,
  ilkFRAXUNI,
  ilkFRAXENS,
  ilkFRAXFRAX,
  ilkFRAXRETH,
]
export const usdtIlks: Ilk[] = [
  ilkUSDTETH,
  ilkUSDTDAI,
  ilkUSDTUSDC,
  ilkUSDTWBTC,
  ilkUSDTWSTETH,
  ilkUSDTLINK,
  ilkUSDTUNI,
  ilkUSDTENS,
  ilkUSDTFRAX,
  ilkUSDTUSDT,
  ilkUSDTRETH,
]

export const ilks: Map<string, Ilk[]> = new Map([
  [ETH, ethIlks],
  [DAI, daiIlks],
  [USDC, usdcIlks],
  [FRAX, fraxIlks],
  [USDT, usdtIlks],
])

/// ----- SERIES -----

export const fyETH2303: Series = {
  seriesId: FYETH2303,
  base: eth,
  fyToken: {
    assetId: FYETH2303,
    address: fyTokens.getOrThrow(FYETH2303)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2303,
    address: pools.getOrThrow(FYETH2303)!,
  },
  ilks: ethIlks,
}

export const fyDAI2303: Series = {
  seriesId: FYDAI2303,
  base: dai,
  fyToken: {
    assetId: FYDAI2303,
    address: fyTokens.getOrThrow(FYDAI2303)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2303,
    address: pools.getOrThrow(FYDAI2303)!,
  },
  ilks: daiIlks,
}

export const fyUSDC2303: Series = {
  seriesId: FYUSDC2303,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2303,
    address: fyTokens.getOrThrow(FYUSDC2303)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2303,
    address: pools.getOrThrow(FYUSDC2303)!,
  },
  ilks: usdcIlks,
}

export const fyFRAX2303: Series = {
  seriesId: FYFRAX2303,
  base: frax,
  fyToken: {
    assetId: FYFRAX2303,
    address: fyTokens.getOrThrow(FYFRAX2303)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYFRAX2303,
    address: pools.getOrThrow(FYFRAX2303)!,
  },
  ilks: ethIlks,
}

export const fyUSDT2303: Series = {
  seriesId: FYUSDT2303,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2303,
    address: fyTokens.getOrThrow(FYUSDT2303)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2303,
    address: pools.getOrThrow(FYUSDT2303)!,
  },
  ilks: usdtIlks,
}

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
  ilks: ethIlks2306,
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
  ilks: daiIlks2306,
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
  ilks: usdcIlks2306,
}

export const fyFRAX2306: Series = {
  seriesId: FYFRAX2306,
  base: frax,
  fyToken: {
    assetId: FYFRAX2306,
    address: fyTokens.getOrThrow(FYFRAX2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYFRAX2306,
    address: pools.getOrThrow(FYFRAX2306)!,
  },
  ilks: ethIlks,
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

export const fyETH2306B: Series = {
  seriesId: FYETH2306B,
  base: eth,
  fyToken: {
    assetId: FYETH2306B,
    address: fyTokens.getOrThrow(FYETH2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2306B,
    address: pools.getOrThrow(FYETH2306B)!,
  },
  ilks: ethIlks2306,
}

export const fyDAI2306B: Series = {
  seriesId: FYDAI2306B,
  base: dai,
  fyToken: {
    assetId: FYDAI2306B,
    address: fyTokens.getOrThrow(FYDAI2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2306B,
    address: pools.getOrThrow(FYDAI2306B)!,
  },
  ilks: daiIlks2306,
}

export const fyUSDC2306B: Series = {
  seriesId: FYUSDC2306B,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2306B,
    address: fyTokens.getOrThrow(FYUSDC2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2306B,
    address: pools.getOrThrow(FYUSDC2306B)!,
  },
  ilks: usdcIlks2306,
}

export const fyUSDT2306B: Series = {
  seriesId: FYUSDT2306B,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2306B,
    address: fyTokens.getOrThrow(FYUSDT2306B)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2306B,
    address: pools.getOrThrow(FYUSDT2306B)!,
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
  [FYETH2303, fyETH2303],
  [FYDAI2303, fyDAI2303],
  [FYUSDC2303, fyUSDC2303],
  [FYFRAX2303, fyFRAX2303],
  [FYUSDT2303, fyUSDT2303],
  [FYETH2306B, fyETH2306B],
  [FYDAI2306B, fyDAI2306B],
  [FYUSDC2306B, fyUSDC2306B],
  [FYFRAX2306, fyFRAX2306],
  [FYUSDT2306B, fyUSDT2306B],
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

export const ysFRAX6MJD: Strategy = {
  assetId: YSFRAX6MJD,
  address: strategyAddresses.getOrThrow(YSFRAX6MJD)!,
  base: frax,
}

export const ysFRAX6MMS: Strategy = {
  assetId: YSFRAX6MMS,
  address: strategyAddresses.getOrThrow(YSFRAX6MMS)!,
  base: frax,
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
  [YSFRAX6MMS, ysFRAX6MMS],
  [YSFRAX6MJD, ysFRAX6MJD],
  [YSUSDT6MMS, ysUSDT6MMS],
  [YSUSDT6MJD, ysUSDT6MJD],
])
