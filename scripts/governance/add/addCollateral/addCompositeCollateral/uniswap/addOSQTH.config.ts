import { parseUnits } from 'ethers/lib/utils'
import {
  COMPOSITE,
  DAI,
  ETH,
  FYDAI2303,
  FYDAI2306,
  FYETH2303,
  FYETH2306,
  FYUSDC2303,
  FYUSDC2306,
  OSQTH,
  RETH_ORACLE,
  UNISWAP,
  USDC,
} from '../../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../../shared/helpers'
import * as base_config from '../../../../base.mainnet.config'

import { Asset, ContractDeployment, Ilk, OraclePath, OracleSource, Series } from '../../../../confTypes'
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales = base_config.whales
const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const deployers = readAddressMappingIfExists('deployers.json')
export const joins = readAddressMappingIfExists('newJoins.json')
export const assets: Map<string, string> = base_config.assets
export const osqth: Asset = { assetId: OSQTH, address: assets.getOrThrow(OSQTH) as string }

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'newJoins.json',
    name: OSQTH,
    contract: 'Join',
    args: [() => assets.getOrThrow(OSQTH)!],
  },
]

export const ilkToETH: Ilk = {
  baseId: ETH,
  ilkId: osqth.assetId,
  asset: osqth,
  collateralization: {
    baseId: ETH,
    ilkId: osqth.assetId,
    oracle: protocol().getOrThrow(UNISWAP)!,
    ratio: 1330000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: osqth.assetId,
    line: 100,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: osqth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.84'), // 105 / 125
    max: parseUnits('1000'),
  },
}

export const ilkToDAI: Ilk = {
  baseId: DAI,
  ilkId: osqth.assetId,
  asset: osqth,
  collateralization: {
    baseId: DAI,
    ilkId: osqth.assetId,
    oracle: protocol().getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: osqth.assetId,
    line: 250000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: osqth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
}

export const ilkToUSDC: Ilk = {
  baseId: USDC,
  ilkId: osqth.assetId,
  asset: osqth,
  collateralization: {
    baseId: USDC,
    ilkId: osqth.assetId,
    oracle: protocol().getOrThrow(COMPOSITE)!,
    ratio: 1670000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: osqth.assetId,
    line: 250000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: osqth.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
}

export const ilks: Ilk[] = [ilkToETH, ilkToDAI, ilkToUSDC]

export const uniswapsources: [string, string, string, number][] = [
  [ETH, OSQTH, '0x82c427AdFDf2d245Ec51D8046b41c4ee87F0d29C', 10],
]

export const oracleSources: OracleSource[] = [
  {
    baseId: ETH,
    baseAddress: assets.getOrThrow(ETH)!,
    quoteId: OSQTH,
    quoteAddress: assets.getOrThrow(OSQTH)!,
    sourceAddress: protocol().getOrThrow(UNISWAP)!,
  },
]

export const oraclePaths: OraclePath[] = [
  {
    baseId: OSQTH,
    quoteId: DAI,
    path: [ETH],
  },
  {
    baseId: OSQTH,
    quoteId: USDC,
    path: [ETH],
  },
]

export const ethSeries: Series[] = [
  {
    seriesId: FYETH2303,
    fyToken: { assetId: FYETH2303, address: fyTokens.getOrThrow(FYETH2303)! },
    chiOracle: '',
    pool: osqth,
    ilks: [ilkToETH],
  },
  {
    seriesId: FYETH2306,
    fyToken: { assetId: FYETH2306, address: fyTokens.getOrThrow(FYETH2306)! },
    chiOracle: '',
    pool: osqth,
    ilks: [ilkToETH],
  },
]

export const daiSeries: Series[] = [
  {
    seriesId: FYDAI2303,
    fyToken: { assetId: FYDAI2303, address: fyTokens.getOrThrow(FYDAI2303)! },
    chiOracle: '',
    pool: osqth,
    ilks: [ilkToDAI],
  },
  {
    seriesId: FYDAI2306,
    fyToken: { assetId: FYDAI2306, address: fyTokens.getOrThrow(FYDAI2306)! },
    chiOracle: '',
    pool: osqth,
    ilks: [ilkToDAI],
  },
]

export const usdcSeries: Series[] = [
  {
    seriesId: FYUSDC2303,
    fyToken: { assetId: FYUSDC2303, address: fyTokens.getOrThrow(FYUSDC2303)! },
    chiOracle: '',
    pool: osqth,
    ilks: [ilkToUSDC],
  },
  {
    seriesId: FYUSDC2306,
    fyToken: { assetId: FYUSDC2306, address: fyTokens.getOrThrow(FYUSDC2306)! },
    chiOracle: '',
    pool: osqth,
    ilks: [ilkToUSDC],
  },
]

export const newSeries: Series[] = [...ethSeries, ...daiSeries, ...usdcSeries]
