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
  RETH,
  RETH_ORACLE,
  USDC,
} from '../../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../../shared/helpers'
import * as base_config from '../../../../base.mainnet.config'
import { Asset, ContractDeployment, Ilk, OraclePath, OracleSource, Series } from '../../../../confTypes'

const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const whales = base_config.whales
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers = readAddressMappingIfExists('deployers.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const joins = readAddressMappingIfExists('joins.json')
export const assets: Map<string, string> = base_config.assets
export const reth: Asset = { assetId: RETH, address: assets.getOrThrow(RETH)! }

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: RETH_ORACLE,
    contract: 'RETHOracle',
    args: [() => ETH, () => RETH, () => assets.getOrThrow(RETH)!],
  },
  {
    addressFile: 'joins.json',
    name: RETH,
    contract: 'Join',
    args: [() => assets.getOrThrow(RETH)!],
  },
]

export const ilkToETH: Ilk = {
  baseId: ETH,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: ETH,
    ilkId: reth.assetId,
    oracle: protocol().getOrThrow(RETH_ORACLE)!,
    ratio: 1330000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: reth.assetId,
    line: 100,
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

export const ilkToDAI: Ilk = {
  baseId: DAI,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: DAI,
    ilkId: reth.assetId,
    oracle: protocol().getOrThrow(COMPOSITE)!,
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

export const ilkToUSDC: Ilk = {
  baseId: USDC,
  ilkId: reth.assetId,
  asset: reth,
  collateralization: {
    baseId: USDC,
    ilkId: reth.assetId,
    oracle: protocol().getOrThrow(COMPOSITE)!,
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
    collateralProportion: parseUnits('0.62874251'), // 105 / 133
    max: parseUnits('1000'),
  },
}

export const ilks: Ilk[] = [ilkToETH, ilkToDAI, ilkToUSDC]

export const oracleSources: OracleSource[] = [
  {
    baseId: ETH,
    baseAddress: assets.getOrThrow(ETH)!,
    quoteId: RETH,
    quoteAddress: assets.getOrThrow(RETH)!,
    sourceAddress: protocol().getOrThrow(RETH_ORACLE)!,
  },
]

export const oraclePaths: OraclePath[] = [
  {
    baseId: RETH,
    quoteId: DAI,
    path: [ETH],
  },
  {
    baseId: RETH,
    quoteId: USDC,
    path: [ETH],
  },
]

export const ethSeries: Series[] = [
  {
    seriesId: FYETH2303,
    fyToken: { assetId: FYETH2303, address: fyTokens.getOrThrow(FYETH2303)! },
    chiOracle: '',
    pool: reth,
    ilks: [ilkToETH],
  },
  {
    seriesId: FYETH2306,
    fyToken: { assetId: FYETH2306, address: fyTokens.getOrThrow(FYETH2306)! },
    chiOracle: '',
    pool: reth,
    ilks: [ilkToETH],
  },
]

export const daiSeries: Series[] = [
  {
    seriesId: FYDAI2303,
    fyToken: { assetId: FYDAI2303, address: fyTokens.getOrThrow(FYDAI2303)! },
    chiOracle: '',
    pool: reth,
    ilks: [ilkToDAI],
  },
  {
    seriesId: FYDAI2306,
    fyToken: { assetId: FYDAI2306, address: fyTokens.getOrThrow(FYDAI2306)! },
    chiOracle: '',
    pool: reth,
    ilks: [ilkToDAI],
  },
]

export const usdcSeries: Series[] = [
  {
    seriesId: FYUSDC2303,
    fyToken: { assetId: FYUSDC2303, address: fyTokens.getOrThrow(FYUSDC2303)! },
    chiOracle: '',
    pool: reth,
    ilks: [ilkToUSDC],
  },
  {
    seriesId: FYUSDC2306,
    fyToken: { assetId: FYUSDC2306, address: fyTokens.getOrThrow(FYUSDC2306)! },
    chiOracle: '',
    pool: reth,
    ilks: [ilkToUSDC],
  },
]

export const newSeries: Series[] = [...ethSeries, ...daiSeries, ...usdcSeries]
