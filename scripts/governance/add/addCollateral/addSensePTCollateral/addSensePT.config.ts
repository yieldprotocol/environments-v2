import { parseUnits } from 'ethers/lib/utils'
import {
  ACCUMULATOR,
  COMPOSITE,
  DAI,
  ETH,
  FYDAI2303,
  FYDAI2306,
  FYETH2303,
  FYETH2306,
  FYUSDC2303,
  FYUSDC2306,
  RATE,
  RETH,
  RETH_ORACLE,
  SPCDAI2307,
  USDC,
} from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { SPWSTETH2304 } from '../../../../../shared/constants'
import * as base_config from '../../../base.mainnet.config'
import { Accumulator, Asset, ContractDeployment, Ilk, OraclePath, OracleSource, Series } from '../../../confTypes'
import { BigNumber } from 'ethers'

const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const whales = base_config.whales
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers = readAddressMappingIfExists('deployers.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const joins = readAddressMappingIfExists('joins.json')
export const assets: Map<string, string> = base_config.assets
export const spwsteth2304: Asset = { assetId: SPWSTETH2304, address: assets.getOrThrow(SPWSTETH2304)! }
export const spcdai2307: Asset = { assetId: SPCDAI2307, address: assets.getOrThrow(SPCDAI2307)! }

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'joins.json',
    name: SPWSTETH2304,
    contract: 'Join',
    args: [() => assets.getOrThrow(SPWSTETH2304)!],
  },
  {
    addressFile: 'joins.json',
    name: SPCDAI2307,
    contract: 'Join',
    args: [() => assets.getOrThrow(SPCDAI2307)!],
  },
]

export const ilkToETH: Ilk = {
  baseId: ETH,
  ilkId: spwsteth2304.assetId,
  asset: spwsteth2304,
  collateralization: {
    baseId: ETH,
    ilkId: spwsteth2304.assetId,
    oracle: protocol().getOrThrow(ACCUMULATOR)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: spwsteth2304.assetId,
    line: 100,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: spwsteth2304.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.95454545454'), // 105 / 110
    max: parseUnits('1000'),
  },
}

export const ilkToDAI: Ilk = {
  baseId: DAI,
  ilkId: spcdai2307.assetId,
  asset: spcdai2307,
  collateralization: {
    baseId: DAI,
    ilkId: spcdai2307.assetId,
    oracle: protocol().getOrThrow(ACCUMULATOR)!,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: DAI,
    ilkId: spcdai2307.assetId,
    line: 250000,
    dust: 1000,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: DAI,
    ilkId: spcdai2307.assetId,
    duration: 3600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.95454545454'), // 105 / 110
    max: parseUnits('1000'),
  },
}

export const ilks: Ilk[] = [ilkToETH, ilkToDAI]

export const oracleSources: Accumulator[] = [
  {
    baseId: SPWSTETH2304,
    kind: ETH,
    startRate: BigNumber.from('1000000000000000000'),
    perSecondRate: BigNumber.from('1000000000000000000'),
  },
  {
    baseId: ETH,
    kind: SPWSTETH2304,
    startRate: BigNumber.from('1000000000000000000'),
    perSecondRate: BigNumber.from('1000000000000000000'),
  },
  {
    baseId: SPCDAI2307,
    kind: DAI,
    startRate: BigNumber.from('1000000000000000000'),
    perSecondRate: BigNumber.from('1000000000000000000'),
  },
  {
    baseId: DAI,
    kind: SPCDAI2307,
    startRate: BigNumber.from('1000000000000000000'),
    perSecondRate: BigNumber.from('1000000000000000000'),
  },
]

export const ethSeries: Series[] = [
  {
    seriesId: FYETH2303,
    fyToken: { assetId: FYETH2303, address: fyTokens.getOrThrow(FYETH2303)! },
    chiOracle: '',
    pool: spwsteth2304,
    ilks: [ilkToETH],
  },
]

export const daiSeries: Series[] = [
  {
    seriesId: FYDAI2303,
    fyToken: { assetId: FYDAI2303, address: fyTokens.getOrThrow(FYDAI2303)! },
    chiOracle: '',
    pool: spcdai2307,
    ilks: [ilkToDAI],
  },
]

export const newSeries: Series[] = [...ethSeries, ...daiSeries]
