import { parseUnits } from 'ethers/lib/utils'
import { ACCUMULATOR, COMPOSITE, YIELD_SPACE_MULTI_ORACLE } from '../../../../../shared/constants'
import { getName, readAddressMappingIfExists } from '../../../../../shared/helpers'
import * as base_config from '../../../base.arb_mainnet.config'
import { Asset, Ilk, OraclePath, OracleSource, Series } from '../../../confTypes'
import { ASSETS_ARBITRUM, NEW_SERIES_ARBITRUM, SERIES_ARBITRUM } from '../../contango-seed-config'

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

export const assetsToAdd: Asset[] = NEW_SERIES_ARBITRUM.map(({ bytes: base }) => ({
  assetId: base,
  address: fyTokens.getOrThrow(base),
}))

export const compositeSources: OracleSource[] = NEW_SERIES_ARBITRUM.map((series) => ({
  baseId: series.bytes,
  baseAddress: fyTokens.getOrThrow(series.bytes),
  quoteId: series.asset.bytes,
  quoteAddress: assets.getOrThrow(series.asset.bytes),
  sourceAddress: protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE),
})) // All fyTokens as collateral use the same oracle

export const compositePaths: OraclePath[] = ASSETS_ARBITRUM.map((asset) =>
  NEW_SERIES_ARBITRUM.filter((series) => series.asset.bytes !== asset.bytes).map((series) => ({
    baseId: asset.bytes,
    quoteId: series.bytes,
    path: [series.asset.bytes],
  }))
).flat()

export const series: Series[] = NEW_SERIES_ARBITRUM.map(({ bytes: seriesId, asset }) => ({
  seriesId,
  base: { assetId: asset.bytes, address: assets.getOrThrow(asset.bytes) },
  fyToken: { assetId: seriesId, address: fyTokens.getOrThrow(seriesId) },
  chiOracle: protocol.getOrThrow(ACCUMULATOR),
  pool: { assetId: seriesId, address: pools.getOrThrow(seriesId) },
  ilks: [],
}))

export const ilks: Ilk[] = ASSETS_ARBITRUM.map((asset) =>
  SERIES_ARBITRUM.filter((series) => series.asset.bytes !== asset.bytes).map((series) => {
    const stablePair = asset.stable && series.asset.stable
    const vaultProportion = stablePair ? parseUnits('1') : parseUnits('0.5')
    const collateralisationRatio = stablePair ? 1.026e6 : series.asset.cr
    const initialDiscount = stablePair ? 1.01e6 : 1.05e6
    const duration = stablePair ? 30 : 300
    const collateralProportion = parseUnits((initialDiscount / collateralisationRatio).toString())

    console.log(`Generating config for ${getName(asset.bytes)}/${getName(series.bytes)}`)

    const ilk: Ilk = {
      baseId: asset.bytes,
      ilkId: series.bytes,
      asset: {
        assetId: series.bytes,
        address: fyTokens.getOrThrow(series.bytes),
      },
      collateralization: {
        baseId: asset.bytes,
        ilkId: series.bytes,
        oracle: protocol.getOrThrow(COMPOSITE),
        ratio: collateralisationRatio,
      },
      debtLimits: {
        baseId: asset.bytes,
        ilkId: series.bytes,
        line: asset.maxDebt,
        dust: asset.minDebt,
        dec: asset.decimals,
      },
      auctionLineAndLimit: {
        baseId: asset.bytes,
        ilkId: series.bytes,
        duration,
        vaultProportion,
        collateralProportion,
        max: parseUnits((asset.maxDebt * 10).toString(), asset.decimals),
      },
    }

    // console.log(ilk)

    return ilk
  })
).flat()
