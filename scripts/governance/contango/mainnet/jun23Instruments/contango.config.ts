import { parseUnits } from 'ethers/lib/utils'
import { CHI, RATE, WAD, YIELD_SPACE_MULTI_ORACLE } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { ASSETS_MAINNET, SERIES_MAINNET } from '../../contango-seed-config'
import * as base_config from '../../../base.arb_mainnet.config'
import { AuctionLineAndLimit, SeriesToAdd } from '../../../confTypes'

export const developer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'
export const deployers = readAddressMappingIfExists('deployers.json')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

export const rateChiSources = ASSETS_MAINNET.map(({ bytes: base }) => [
  [base, RATE, WAD.toString(), WAD.toString()] as const,
  [base, CHI, WAD.toString(), WAD.toString()] as const,
]).flat()

// Assets that will be made into a base
export const bases: Array<[string, string]> = ASSETS_MAINNET.map(({ bytes: base }) => [base, joins.getOrThrow(base)])

// Input data: baseId, quoteId, oracle name
export const compositeSources = SERIES_MAINNET.map(
  (series) => [series.bytes, series.asset.bytes, protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE)] as const
) // All fyTokens as collateral use the same oracle

// Input data: assetId, assetId, [intermediate assetId]
export const compositePaths = ASSETS_MAINNET.map((asset) =>
  SERIES_MAINNET.filter((series) => series.asset.code !== asset.code).map(
    (series) => [asset.bytes, series.bytes, [series.asset.bytes]] as const
  )
).flat()

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
/// @param Address for the join
export const assetsToAdd = [
  SERIES_MAINNET.map(({ bytes: base }) => [base, fyTokens.getOrThrow(base), joins.getOrThrow(base)] as const),
].flat()

export const seriesToAdd: SeriesToAdd[] = SERIES_MAINNET.map(({ bytes: seriesId }) => ({
  seriesId,
  fyToken: fyTokens.getOrThrow(seriesId),
}))

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
/// @notice Collateralisation parameters and debt limits for each new asset pair
/// @param Base asset identifier (bytes6 tag)
/// @param Collateral asset identifier (bytes6 tag)
/// @param Collateralisation ratio, with six decimals
/// @param Maximum protocol debt, decimals to be added
/// @param Minimum vault debt, decimals to be added
/// @param Decimals to add to maximum protocol debt, and minimum vault debt.
export const fyTokenDebtLimits = ASSETS_MAINNET.map((asset) =>
  SERIES_MAINNET.filter((series) => series.asset.code !== asset.code).map((series) => {
    const collateralisationRatio = asset.stable && series.asset.stable ? 1100000 : 1400000
    return [asset.bytes, series.bytes, collateralisationRatio, asset.maxDebt, asset.minDebt, asset.decimals] as const
  })
).flat()

export const auctionLineAndLimits: AuctionLineAndLimit[] = ASSETS_MAINNET.map((asset) =>
  SERIES_MAINNET.filter((series) => series.asset.code !== asset.code).map((series) => {
    const stablePair = asset.stable && series.asset.stable
    const vaultProportion = stablePair ? parseUnits('1') : parseUnits('0.5')
    const collateralisationRatio = stablePair ? 1100000 : 1400000
    const initialDiscount = 1050000
    const collateralProportion = parseUnits((initialDiscount / collateralisationRatio).toString())

    return {
      baseId: asset.bytes,
      ilkId: series.bytes,
      duration: 600,
      vaultProportion,
      collateralProportion,
      max: parseUnits((asset.maxDebt * 10).toString(), asset.decimals),
    }
  })
).flat()

// Input data: seriesId, [ilkIds]
/// @notice New asset pairs to be accepted
/// @param Base asset identifier (bytes6 tag)
/// @param Array of collateral asset identifiers (bytes6 tag array)
export const seriesIlks: Array<[string, string[]]> = SERIES_MAINNET.map((base) => {
  const ilks = SERIES_MAINNET.filter(
    (ilk) => ilk.asset.code !== base.asset.code && ilk.expiry.timestamp === base.expiry.timestamp
  )
  return [base.bytes, ilks.map(({ bytes }) => bytes)]
})
