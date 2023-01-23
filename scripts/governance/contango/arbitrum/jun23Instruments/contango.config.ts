import { parseUnits } from 'ethers/lib/utils'
import { YIELD_SPACE_MULTI_ORACLE } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { ASSETS_ARBITRUM, SERIES_ARBITRUM } from '../../../../../shared/typed-constants'
import * as base_config from '../../../base.arb_mainnet.config'
import { AuctionLineAndLimit, SeriesToAdd } from '../../../confTypes'

export const developer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'
export const deployers = readAddressMappingIfExists('deployers.json')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

// Input data: baseId, quoteId, oracle name
export const compositeSources = SERIES_ARBITRUM.map(
  (series) => [series.bytes, series.asset.bytes, protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE)] as const
) // All fyTokens as collateral use the same oracle

// Input data: assetId, assetId, [intermediate assetId]
export const compositePaths = ASSETS_ARBITRUM.map((asset) =>
  SERIES_ARBITRUM.filter((series) => series.asset.code !== asset.code).map(
    (series) => [asset.bytes, series.bytes, [series.asset.bytes]] as const
  )
).flat()

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
/// @param Address for the join
export const assetsToAdd = [
  SERIES_ARBITRUM.map(({ bytes: base }) => [base, fyTokens.getOrThrow(base), joins.getOrThrow(base)] as const),
].flat()

export const seriesToAdd: SeriesToAdd[] = SERIES_ARBITRUM.map(({ bytes: seriesId }) => ({
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
export const fyTokenDebtLimits = ASSETS_ARBITRUM.map((asset) =>
  SERIES_ARBITRUM.filter((series) => series.asset.code !== asset.code).map((series) => {
    const collateralisationRatio = asset.stable && series.asset.stable ? 1100000 : 1400000
    return [asset.bytes, series.bytes, collateralisationRatio, asset.maxDebt, asset.minDebt, asset.decimals] as const
  })
).flat()

export const auctionLineAndLimits: AuctionLineAndLimit[] = ASSETS_ARBITRUM.map((asset) =>
  SERIES_ARBITRUM.filter((series) => series.asset.code !== asset.code).map((series) => {
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
export const seriesIlks: Array<[string, string[]]> = SERIES_ARBITRUM.map((base) => {
  const ilks = SERIES_ARBITRUM.filter(
    (ilk) => ilk.asset.code !== base.asset.code && ilk.expiry.timestamp === base.expiry.timestamp
  )
  return [base.bytes, ilks.map(({ bytes }) => bytes)]
})
