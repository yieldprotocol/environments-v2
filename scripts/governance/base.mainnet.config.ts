import { parseUnits } from 'ethers/lib/utils'
import { readAddressMappingIfExists } from '../../shared/helpers'
import {
  DAI,
  ENS,
  ETH,
  FRAX,
  LINK,
  STETH,
  UNI,
  USDC,
  WBTC,
  WSTETH,
  CRAB,
  YVDAI,
  YVUSDC,
  USDT,
  RETH,
  YSDAI6MMSASSET,
  YSDAI6MJDASSET,
  YSUSDC6MMSASSET,
  YSUSDC6MJDASSET,
  YSETH6MMSASSET,
  YSETH6MJDASSET,
  YSFRAX6MMSASSET,
  YSFRAX6MJDASSET,
  FETH2303,
  NOTIONAL,
  FETH2306,
  FDAI2303,
  FDAI2306,
  FUSDC2303,
  FUSDC2306,
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
  FYETH2309,
  FYDAI2309,
  FYUSDC2309,
  FYFRAX2309,
  FYUSDT2309,
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
  STRATEGY_ORACLE,
  RETH_ORACLE,
} from '../../shared/constants'
import { WAD, ONEUSDC, ONEWBTC } from '../../shared/constants'

export const external = readAddressMappingIfExists('external.json')
export const assets = readAddressMappingIfExists('assets.json')
export const protocol = readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const deployers = readAddressMappingIfExists('deployers.json')
export const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const pools = readAddressMappingIfExists('pools.json')
export const joins = readAddressMappingIfExists('joins.json')
export const strategyAddresses = readAddressMappingIfExists('strategies.json') // TODO: Name clash :(

export const chainId = 1

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = new Map([
  [ETH, '0xd51a44d3fae010294c616388b506acda1bfaae46'],
  [DAI, '0x16b34ce9a6a6f7fc2dd25ba59bf7308e7b38e186'],
  [USDC, '0xcffad3200574698b78f32232aa9d63eabd290703'],
  [WBTC, '0xd51a44d3fae010294c616388b506acda1bfaae46'],
  [WSTETH, '0x10cd5fbe1b404b7e19ef964b63939907bdaf42e2'],
  [STETH, '0x1982b2f5814301d4e9a8b0201555376e62f82428'],
  [LINK, '0x0d4f1ff895d12c34994d6b65fabbeefdc1a9fb39'],
  [ENS, '0xd7a029db2585553978190db5e85ec724aa4df23f'],
  [YVUSDC, '0x5934807cc0654d46755ebd2848840b616256c6ef'],
  [YVDAI, '0x50da1e9c57c334bb3a7bc10ddb6860331ec3c62a'],
  [UNI, '0x47173b170c64d16393a52e6c480b3ad8c302ba1e'],
  [FRAX, '0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52'],
  [USDT, '0x5041ed759dd4afc3a72b8192c143f72f4724081a'],
  [YSDAI6MMSASSET, '0x232c412d3613d5915fc1ebf6eb8d14f11b6a260d'],
  [YSDAI6MJDASSET, '0x9185df15078547055604f5c0b02fc1c8d93594a5'],
  [YSUSDC6MMSASSET, '0x3250e201c2eb06d086138f181e0fb6d1fe33f7d1'],
  [YSUSDC6MJDASSET, '0x64d226daf361f4f2cc5ad48b7501a7ea2598859f'],
  [YSETH6MMSASSET, '0xbe6cce2753c0e99bc9e1b1bea946d35921aabd49'],
  [YSETH6MJDASSET, '0x3336581a28870d343e085beae4cec23f47838899'],
  [YSFRAX6MMSASSET, '0x430e076e5292e0028a0a17a00a65c43e6ee7fb91'],
  [YSFRAX6MJDASSET, '0x3b870db67a45611cf4723d44487eaf398fac51e3'],
  [CRAB, '0xa1cab67a4383312718a5799eaa127906e9d4b19e'],
  [RETH, '0x7c5aaa2a20b01df027ad032f7a768ac015e77b86'],
])

import { Asset, Base, Ilk, Series, Strategy } from './confTypes'

export const ONEUSDT = ONEUSDC

const eth: Base = {
  assetId: ETH,
  address: assets.getOrThrow(ETH)!,
  rateOracle: protocol.getOrThrow(COMPOUND)!,
}

const dai: Base = {
  assetId: DAI,
  address: assets.getOrThrow(DAI)!,
  rateOracle: protocol.getOrThrow(COMPOUND)!,
}

const usdc: Base = {
  assetId: USDC,
  address: assets.getOrThrow(USDC)!,
  rateOracle: protocol.getOrThrow(COMPOUND)!,
}

const frax: Base = {
  assetId: FRAX,
  address: assets.getOrThrow(FRAX)!,
  rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
}

// const usdt: Base = {
//   assetId: USDT,
//   address: assets.getOrThrow(USDT)!,
//   rateOracle: protocol.getOrThrow(ACCUMULATOR)!,
// }

const reth: Asset = {
  assetId: RETH,
  address: assets.getOrThrow(RETH)!,
}

export const bases: Map<string, Base> = new Map([
  [ETH, eth],
  [DAI, dai],
  [USDC, usdc],
  [FRAX, frax],
  //  [USDT, usdt],
])

/// -------------------------------- ETH --------------------------------

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

const ilkETHWBTC: Ilk = {
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

const ilkETHWSTETH: Ilk = {
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

const ilkETHLINK: Ilk = {
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

const ilkETHUNI: Ilk = {
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

const ilkETHENS: Ilk = {
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

const ilkETHFRAX: Ilk = {
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

export const ilkETHFETH2303: Ilk = {
  baseId: ETH,
  ilkId: FETH2303,
  asset: { assetId: FETH2303, address: assets.getOrThrow(FETH2303)! },
  collateralization: {
    baseId: ETH,
    ilkId: FETH2303,
    oracle: protocol.getOrThrow(NOTIONAL)!,
    ratio: 1330000,
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
    ratio: 1330000,
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

/// ---------------------------- DAI ----------------------------

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

const ilkDAIWBTC: Ilk = {
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

const ilkDAIWSTETH: Ilk = {
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

const ilkDAILINK: Ilk = {
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

const ilkDAIUNI: Ilk = {
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

const ilkDAIENS: Ilk = {
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

const ilkDAIFRAX: Ilk = {
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
    ratio: 1670000,
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
    ratio: 1670000,
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

/// ---------------------------- USDC ----------------------------

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

const ilkUSDCWBTC: Ilk = {
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

const ilkUSDCWSTETH: Ilk = {
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

const ilkUSDCLINK: Ilk = {
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

const ilkUSDCUNI: Ilk = {
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

const ilkUSDCENS: Ilk = {
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

const ilkUSDCFRAX: Ilk = {
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

const ilkUSDCYVUSDC: Ilk = {
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
    ratio: 1670000,
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
    ratio: 1670000,
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

/// ---------------------------- FRAX ----------------------------

const ilkFRAXFRAX: Ilk = {
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

const ilkFRAXETH: Ilk = {
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

const ilkFRAXDAI: Ilk = {
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

const ilkFRAXUSDC: Ilk = {
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

const ilkFRAXWBTC: Ilk = {
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

const ilkFRAXWSTETH: Ilk = {
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

const ilkFRAXLINK: Ilk = {
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

const ilkFRAXUNI: Ilk = {
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

const ilkFRAXENS: Ilk = {
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

// const ilkUSDTUSDT: Ilk = {
//   baseId: USDT,
//   ilkId: USDT,
//   asset: {
//     assetId: USDT,
//     address: assets.getOrThrow(USDT)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: USDT,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1000000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: USDT,
//     line: 100000000,
//     dust: 0,
//     dec: 6,
//   },
//   // No auction line and limit for USDT/USDT
// }

// const ilkUSDTETH: Ilk = {
//   baseId: USDT,
//   ilkId: ETH,
//   asset: {
//     assetId: ETH,
//     address: assets.getOrThrow(ETH)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: ETH,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1400000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: ETH,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: ETH,
//     duration: 3600,
//     vaultProportion: WAD.div(2),
//     collateralProportion: WAD.mul(1050000).div(1400000),
//     max: WAD.mul(1000), // $10M
//   },
// }
//
// const ilkUSDTDAI: Ilk = {
//   baseId: USDT,
//   ilkId: DAI,
//   asset: {
//     assetId: DAI,
//     address: assets.getOrThrow(DAI)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: DAI,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1100000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: DAI,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: DAI,
//     duration: 3600,
//     vaultProportion: WAD,
//     collateralProportion: WAD.mul(1050000).div(1100000),
//     max: WAD.mul(10000000),
//   },
// }
//
// const ilkUSDTUSDC: Ilk = {
//   baseId: USDT,
//   ilkId: USDC,
//   asset: {
//     assetId: USDC,
//     address: assets.getOrThrow(USDC)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: USDC,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1100000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: USDC,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: USDC,
//     duration: 3600,
//     vaultProportion: WAD,
//     collateralProportion: WAD.mul(1050000).div(1100000),
//     max: ONEUSDT.mul(10000000),
//   },
// }
//
// const ilkUSDTWBTC: Ilk = {
//   baseId: USDT,
//   ilkId: WBTC,
//   asset: {
//     assetId: WBTC,
//     address: assets.getOrThrow(WBTC)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: WBTC,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1500000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: WBTC,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: WBTC,
//     duration: 3600,
//     vaultProportion: WAD.div(2),
//     collateralProportion: WAD.mul(1050000).div(1500000),
//     max: ONEWBTC.mul(1000),
//   },
// }
//
// const ilkUSDTWSTETH: Ilk = {
//   baseId: USDT,
//   ilkId: WSTETH,
//   asset: {
//     assetId: WSTETH,
//     address: assets.getOrThrow(WSTETH)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: WSTETH,
//     oracle: protocol.getOrThrow(COMPOSITE)!,
//     ratio: 1400000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: WSTETH,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: WSTETH,
//     duration: 3600,
//     vaultProportion: WAD.div(2),
//     collateralProportion: WAD.mul(1050000).div(1400000),
//     max: WAD.mul(10000),
//   },
// }
//
// const ilkUSDTLINK: Ilk = {
//   baseId: USDT,
//   ilkId: LINK,
//   asset: {
//     assetId: LINK,
//     address: assets.getOrThrow(LINK)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: LINK,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1670000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: LINK,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: LINK,
//     duration: 3600,
//     vaultProportion: WAD.div(2),
//     collateralProportion: WAD.mul(1050000).div(1670000),
//     max: WAD.mul(100000),
//   },
// }
//
// const ilkUSDTUNI: Ilk = {
//   baseId: USDT,
//   ilkId: UNI,
//   asset: {
//     assetId: UNI,
//     address: assets.getOrThrow(UNI)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: UNI,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1670000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: UNI,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: UNI,
//     duration: 3600,
//     vaultProportion: WAD.div(2),
//     collateralProportion: WAD.mul(1050000).div(1670000),
//     max: WAD.mul(100000),
//   },
// }
//
// const ilkUSDTENS: Ilk = {
//   baseId: USDT,
//   ilkId: ENS,
//   asset: {
//     assetId: ENS,
//     address: assets.getOrThrow(ENS)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: ENS,
//     oracle: protocol.getOrThrow(COMPOSITE)!,
//     ratio: 1670000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: ENS,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: ENS,
//     duration: 3600,
//     vaultProportion: WAD.div(2),
//     collateralProportion: WAD.mul(1050000).div(1670000),
//     max: WAD.mul(10000),
//   },
// }
//
// const ilkUSDTFRAX: Ilk = {
//   baseId: USDT,
//   ilkId: FRAX,
//   asset: {
//     assetId: FRAX,
//     address: assets.getOrThrow(FRAX)!,
//   },
//   collateralization: {
//     baseId: USDT,
//     ilkId: FRAX,
//     oracle: protocol.getOrThrow(CHAINLINK)!,
//     ratio: 1150000,
//   },
//   debtLimits: {
//     baseId: USDT,
//     ilkId: FRAX,
//     line: 100000,
//     dust: 1000,
//     dec: 6,
//   },
//   auctionLineAndLimit: {
//     baseId: USDT,
//     ilkId: FRAX,
//     duration: 3600,
//     vaultProportion: WAD.div(2),
//     collateralProportion: WAD.mul(1050000).div(1150000),
//     max: WAD.mul(10000000),
//   },
// }

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
]
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
]
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
  ilkUSDCYVUSDC,
  ilkUSDCRETH,
]
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
// export const usdtIlks: Ilk[] = [
//   ilkUSDTETH,
//   ilkUSDTDAI,
//   ilkUSDTUSDC,
//   ilkUSDTWBTC,
//   ilkUSDTWSTETH,
//   ilkUSDTLINK,
//   ilkUSDTUNI,
//   ilkUSDTENS,
//   ilkUSDTFRAX,
// ]

export const ilks: Map<string, Ilk[]> = new Map([
  [ETH, ethIlks],
  [DAI, daiIlks],
  [USDC, usdcIlks],
  [FRAX, fraxIlks],
  //  [USDT, usdtIlks],
])

/// ----- SERIES -----

const fyETH2303: Series = {
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

const fyETH2306: Series = {
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

// const fyETH2309: Series = {
//   seriesId: FYETH2309,
//   base: eth,
//   fyToken: {
//     assetId: FYETH2309,
//     address: fyTokens.getOrThrow(FYETH2309)!,
//   },
//   chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
//   pool: {
//     assetId: FYETH2309,
//     address: pools.getOrThrow(FYETH2306)!,
//   },
//   ilks: ethIlks,
// }

const fyDAI2303: Series = {
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

const fyDAI2306: Series = {
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

// const fyDAI2309: Series = {
//   seriesId: FYDAI2309,
//   base: dai,
//   fyToken: {
//     assetId: FYDAI2306,
//     address: fyTokens.getOrThrow(FYDAI2309)!,
//   },
//   chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
//   pool: {
//     assetId: FYDAI2309,
//     address: pools.getOrThrow(FYDAI2309)!,
//   },
//   ilks: daiIlks,
// }

const fyUSDC2303: Series = {
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

const fyUSDC2306: Series = {
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

// const fyUSDC2309: Series = {
//   seriesId: FYUSDC2309,
//   base: usdc,
//   fyToken: {
//     assetId: FYUSDC2309,
//     address: fyTokens.getOrThrow(FYUSDC2309)!,
//   },
//   chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
//   pool: {
//     assetId: FYUSDC2309,
//     address: pools.getOrThrow(FYUSDC2306)!,
//   },
//   ilks: usdcIlks,
// }

const fyFRAX2303: Series = {
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

const fyFRAX2306: Series = {
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

// const fyFRAX2309: Series = {
//   seriesId: FYFRAX2309,
//   base: frax,
//   fyToken: {
//     assetId: FYFRAX2309,
//     address: fyTokens.getOrThrow(FYFRAX2309)!,
//   },
//   chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
//   pool: {
//     assetId: FYFRAX2309,
//     address: pools.getOrThrow(FYFRAX2309)!,
//   },
//   ilks: ethIlks,
// }

// const fyUSDT2303: Series = {
//   seriesId: FYUSDT2303,
//   base: usdt,
//   fyToken: {
//     assetId: FYUSDT2303,
//     address: fyTokens.getOrThrow(FYUSDT2303)!,
//   },
//   chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
//   pool: {
//     assetId: FYUSDT2303,
//     address: pools.getOrThrow(FYUSDT2303)!,
//   },
//   ilks: usdtIlks,
// }

// const fyUSDT2306: Series = {
//   seriesId: FYUSDT2306,
//   base: usdt,
//   fyToken: {
//     assetId: FYUSDT2306,
//     address: fyTokens.getOrThrow(FYUSDT2306)!,
//   },
//   chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
//   pool: {
//     assetId: FYUSDT2306,
//     address: pools.getOrThrow(FYUSDT2306)!,
//   },
//   ilks: usdtIlks,
// }

// const fyUSDT2309: Series = {
//   seriesId: FYUSDT2309,
//   base: usdt,
//   fyToken: {
//     assetId: FYUSDT2309,
//     address: fyTokens.getOrThrow(FYUSDT2309)!,
//   },
//   chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
//   pool: {
//     assetId: FYUSDT2309,
//     address: pools.getOrThrow(FYUSDT2309)!,
//   },
//   ilks: usdtIlks,
// }

export const series: Map<string, Series> = new Map([
  [FYETH2303, fyETH2303],
  [FYDAI2303, fyDAI2303],
  [FYUSDC2303, fyUSDC2303],
  [FYFRAX2303, fyFRAX2303],
  // [FYUSDT2303, fyUSDT2303],
  [FYETH2306, fyETH2306],
  [FYDAI2306, fyDAI2306],
  [FYUSDC2306, fyUSDC2306],
  [FYFRAX2306, fyFRAX2306],
  // [FYUSDT2306, fyUSDT2306],
  //  [FYETH2309, fyETH2309],
  //  [FYDAI2309, fyDAI2309],
  //  [FYUSDC2309, fyUSDC2309],
  //  [FYFRAX2309, fyFRAX2309],
  //  [FYUSDT2309, fyUSDT2309],
])

/// ----- STRATEGIES -----

// const ysETH6MMS: Strategy = {
//   assetId: YSETH6MMS,
//   address: strategyAddresses.getOrThrow(YSETH6MMS)!,
//   base: eth,
// }

const ysETH6MJD: Strategy = {
  assetId: YSETH6MJD,
  address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  base: eth,
}

// const ysDAI6MMS: Strategy = {
//   assetId: YSDAI6MMS,
//   address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
//   base: dai,
// }

const ysDAI6MJD: Strategy = {
  assetId: YSDAI6MJD,
  address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  base: dai,
}

// const ysUSDC6MMS: Strategy = {
//   assetId: YSUSDC6MMS,
//   address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
//   base: usdc,
// }

const ysUSDC6MJD: Strategy = {
  assetId: YSUSDC6MJD,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  base: usdc,
}

// const ysFRAX6MMS: Strategy = {
//   assetId: YSFRAX6MMS,
//   address: strategyAddresses.getOrThrow(YSFRAX6MMS)!,
//   base: frax,
// }

const ysFRAX6MJD: Strategy = {
  assetId: YSFRAX6MJD,
  address: strategyAddresses.getOrThrow(YSFRAX6MJD)!,
  base: frax,
}

// const ysUSDT6MMS: Strategy = {
//   assetId: YSUSDT6MMS,
//   address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
//   base: usdt,
// }

// const ysUSDT6MJD: Strategy = {
//   assetId: YSUSDT6MJD,
//   address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
//   base: usdt,
// }

export const strategies: Map<string, Strategy> = new Map([
  //  [YSETH6MMS, ysETH6MMS],
  [YSETH6MJD, ysETH6MJD],
  //  [YSDAI6MMS, ysDAI6MMS],
  [YSDAI6MJD, ysDAI6MJD],
  //  [YSUSDC6MMS, ysUSDC6MMS],
  [YSUSDC6MJD, ysUSDC6MJD],
  //  [YSFRAX6MMS, ysFRAX6MMS],
  [YSFRAX6MJD, ysFRAX6MJD],
  //  [YSUSDT6MMS, ysUSDT6MMS],
  //  [YSUSDT6MJD, ysUSDT6MJD],
])
