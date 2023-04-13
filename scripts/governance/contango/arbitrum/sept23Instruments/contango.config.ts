import { parseUnits } from 'ethers/lib/utils'
import {
  ACCUMULATOR,
  CHAINLINKUSD,
  COMPOSITE,
  EOMAR23,
  IDENTITY_ORACLE,
  USDT,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../../shared/constants'
import { getName, readAddressMappingIfExists } from '../../../../../shared/helpers'
import * as base_config from '../../../base.arb_mainnet.config'
import { Asset, Base, Ilk, OraclePath, OracleSource, Series } from '../../../confTypes'
import {
  ASSETS_ARBITRUM,
  ASSETS_ARBITRUM_MAP,
  JUNE_SERIES_ARBITRUM,
  NEW_SERIES_ARBITRUM,
  Series as SeriesSeed,
  SERIES_ARBITRUM,
} from '../../contango-seed-config'

export const developer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'
export const deployers = readAddressMappingIfExists('deployers.json')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

export const newJoins: string[] = NEW_SERIES_ARBITRUM.map(({ bytes: seriesId }) => joins.getOrThrow(seriesId))

const usdt: Base = {
  assetId: USDT,
  address: assets.getOrThrow(USDT),
  rateOracle: protocol.getOrThrow(ACCUMULATOR),
}

export const assetsToAdd: Asset[] = NEW_SERIES_ARBITRUM.filter(({ timestamp }) => timestamp > EOMAR23)
  .map(({ bytes: base }) => ({
    assetId: base,
    address: fyTokens.getOrThrow(base),
  }))
  .concat(usdt)

export const basesToAdd: Base[] = [usdt]

export const compositeSources: OracleSource[] = SERIES_ARBITRUM.map((series) => ({
  baseId: series.bytes,
  baseAddress: fyTokens.getOrThrow(series.bytes),
  quoteId: series.asset.bytes,
  quoteAddress: assets.getOrThrow(series.asset.bytes),
  sourceAddress: protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE), // All fyTokens as collateral use the same oracle
})).concat(
  ASSETS_ARBITRUM.map((asset) => ({
    baseId: ASSETS_ARBITRUM_MAP.getOrThrow(USDT).bytes,
    baseAddress: assets.getOrThrow(USDT),
    quoteId: asset.bytes,
    quoteAddress: assets.getOrThrow(asset.bytes),
    sourceAddress: protocol.getOrThrow(CHAINLINKUSD),
  }))
)

export const compositePaths: OraclePath[] = ASSETS_ARBITRUM.map((asset) =>
  SERIES_ARBITRUM.filter((series) => series.asset.bytes !== asset.bytes).map((series) => ({
    baseId: asset.bytes,
    quoteId: series.bytes,
    path: [series.asset.bytes],
  }))
).flat()

export const newSeries: Series[] = createSeries(NEW_SERIES_ARBITRUM)
export const juneSeries: Series[] = createSeries(JUNE_SERIES_ARBITRUM)

function createSeries(seed: SeriesSeed[]): Series[] {
  return seed.map((series: SeriesSeed) => {
    const { bytes: seriesId, asset } = series
    return {
      seriesId,
      base: { assetId: asset.bytes, address: assets.getOrThrow(asset.bytes) },
      fyToken: { assetId: seriesId, address: fyTokens.getOrThrow(seriesId) },
      chiOracle: protocol.getOrThrow(ACCUMULATOR),
      pool: { assetId: seriesId, address: pools.getOrThrow(seriesId) },
      ilks: createIlks(series),
    }
  })
}

function createIlks(baseSeries: SeriesSeed): Ilk[] {
  return SERIES_ARBITRUM.filter(
    (ilkSeries) => ilkSeries.asset.bytes !== baseSeries.asset.bytes && ilkSeries.timestamp === baseSeries.timestamp
  )
    .map((ilkSeries) => {
      const stablePair = ilkSeries.asset.stable && baseSeries.asset.stable
      const vaultProportion = stablePair ? parseUnits('1') : parseUnits('0.5')
      const collateralisationRatio = stablePair ? 1.026e6 : ilkSeries.asset.cr
      const initialDiscount = stablePair ? 1.01e6 : 1.05e6
      const duration = stablePair ? 30 : 300
      const collateralProportion = parseUnits((initialDiscount / collateralisationRatio).toString())

      console.log(`Generating config for ${getName(baseSeries.bytes)}/${getName(ilkSeries.bytes)}`)

      const ilk: Ilk = {
        baseId: baseSeries.asset.bytes,
        ilkId: ilkSeries.bytes,
        asset: {
          assetId: baseSeries.asset.bytes,
          address: assets.getOrThrow(baseSeries.asset.bytes),
        },
        collateralization: {
          baseId: baseSeries.asset.bytes,
          ilkId: ilkSeries.bytes,
          oracle: protocol.getOrThrow(COMPOSITE),
          ratio: collateralisationRatio,
        },
        debtLimits: {
          baseId: baseSeries.asset.bytes,
          ilkId: ilkSeries.bytes,
          line: baseSeries.asset.maxDebt,
          dust: baseSeries.asset.minDebt,
          dec: baseSeries.asset.decimals,
        },
        auctionLineAndLimit: {
          baseId: baseSeries.asset.bytes,
          ilkId: ilkSeries.bytes,
          duration,
          vaultProportion,
          collateralProportion,
          max: parseUnits((baseSeries.asset.maxDebt * 10).toString(), baseSeries.asset.decimals),
        },
      }

      // console.log(ilk)

      return ilk
    })
    .concat(createSelfIlk(baseSeries))
}

function createSelfIlk(series: SeriesSeed): Ilk {
  const ilk: Ilk = {
    baseId: series.asset.bytes,
    ilkId: series.asset.bytes,
    asset: {
      assetId: series.asset.bytes,
      address: assets.getOrThrow(series.asset.bytes),
    },
    collateralization: {
      baseId: series.asset.bytes,
      ilkId: series.asset.bytes,
      oracle: protocol.getOrThrow(IDENTITY_ORACLE),
      ratio: 1e6,
    },
    debtLimits: {
      baseId: series.asset.bytes,
      ilkId: series.asset.bytes,
      line: series.asset.maxDebt * 10,
      dust: 0,
      dec: series.asset.decimals,
    },
  }

  // console.log(ilk)

  return ilk
}
