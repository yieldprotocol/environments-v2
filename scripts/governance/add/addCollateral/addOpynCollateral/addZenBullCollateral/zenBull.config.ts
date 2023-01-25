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
  ZENBULL,
  ZENBULL_ORACLE,
  USDC,
  CRAB,
} from '../../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../../shared/helpers'
import * as base_config from '../../../../base.mainnet.config'
import { Asset, ContractDeployment, Ilk, OraclePath, OracleSource, Series } from '../../../../confTypes'

const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const whales = base_config.whales
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const joins = readAddressMappingIfExists('newJoins.json')
export const assets: Map<string, string> = base_config.assets
export const zenbull: Asset = { assetId: ZENBULL, address: assets.getOrThrow(ZENBULL) as string }

const osqthWethPool = '0x82c427AdFDf2d245Ec51D8046b41c4ee87F0d29C'
const wethUsdcPool = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8'
const eulerDToken = '0x84721A3dB22EB852233AEAE74f9bC8477F8bcc42'
const eulerEToken = '0x1b808F49ADD4b8C6b5117d9681cF7312Fcf0dC1D'

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: ZENBULL_ORACLE,
    contract: 'ZenBullOracle',
    args: [
      () => assets.getOrThrow(CRAB)!,
      () => assets.getOrThrow(ZENBULL)!,
      () => osqthWethPool,
      () => wethUsdcPool,
      () => eulerDToken,
      () => eulerEToken,
      () => USDC,
      () => ZENBULL,
    ],
  },
  {
    addressFile: 'newJoins.json',
    name: ZENBULL,
    contract: 'Join',
    args: [() => assets.getOrThrow(ZENBULL)],
  },
]

export const ilkToETH: Ilk = {
  baseId: ETH,
  ilkId: zenbull.assetId,
  asset: zenbull,
  collateralization: {
    baseId: ETH,
    ilkId: zenbull.assetId,
    oracle: protocol().getOrThrow(COMPOSITE)! as string,
    ratio: 1250000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: zenbull.assetId,
    line: 100,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: zenbull.assetId,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.84'), // 105 / 125
    max: parseUnits('1000'),
  },
}

export const ilkToDAI: Ilk = {
  baseId: DAI,
  ilkId: zenbull.assetId,
  asset: zenbull,
  collateralization: {
    baseId: DAI,
    ilkId: zenbull.assetId,
    oracle: protocol().getOrThrow(COMPOSITE)! as string,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: zenbull.assetId,
    line: 250000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: zenbull.assetId,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
}

export const ilkToUSDC: Ilk = {
  baseId: USDC,
  ilkId: zenbull.assetId,
  asset: zenbull,
  collateralization: {
    baseId: USDC,
    ilkId: zenbull.assetId,
    oracle: protocol().getOrThrow(ZENBULL_ORACLE)! as string,
    ratio: 1400000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: zenbull.assetId,
    line: 250000,
    dust: 1000,
    dec: 6,
  },
  auctionLineAndLimit: {
    baseId: USDC,
    ilkId: zenbull.assetId,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
}

export const ilks: Ilk[] = [ilkToETH, ilkToDAI, ilkToUSDC]

export const oracleSources: OracleSource[] = [
  {
    baseId: USDC,
    baseAddress: assets.getOrThrow(USDC)!,
    quoteId: ZENBULL,
    quoteAddress: assets.getOrThrow(ZENBULL)!,
    sourceAddress: protocol().getOrThrow(ZENBULL_ORACLE)! as string,
  },
]

export const oraclePaths: OraclePath[] = [
  {
    baseId: ZENBULL,
    quoteId: DAI,
    path: [USDC],
  },
  {
    baseId: ZENBULL,
    quoteId: ETH,
    path: [USDC],
  },
]

export const ethSeries: Series[] = [
  {
    seriesId: FYETH2303,
    fyToken: { assetId: FYETH2303, address: fyTokens.get(FYETH2303) as string },
    ilks: [ilkToETH],
  },
  {
    seriesId: FYETH2306,
    fyToken: { assetId: FYETH2306, address: fyTokens.get(FYETH2306) as string },
    ilks: [ilkToETH],
  },
]

export const daiSeries: Series[] = [
  {
    seriesId: FYDAI2303,
    fyToken: { assetId: FYDAI2303, address: fyTokens.get(FYDAI2303) as string },
    ilks: [ilkToDAI],
  },
  {
    seriesId: FYDAI2306,
    fyToken: { assetId: FYDAI2306, address: fyTokens.get(FYDAI2306) as string },
    ilks: [ilkToDAI],
  },
]

export const usdcSeries: Series[] = [
  {
    seriesId: FYUSDC2303,
    fyToken: { assetId: FYUSDC2303, address: fyTokens.get(FYUSDC2303) as string },
    ilks: [ilkToUSDC],
  },
  {
    seriesId: FYUSDC2306,
    fyToken: { assetId: FYUSDC2306, address: fyTokens.get(FYUSDC2306) as string },
    ilks: [ilkToUSDC],
  },
]

export const newSeries: Series[] = [...ethSeries, ...daiSeries, ...usdcSeries]
