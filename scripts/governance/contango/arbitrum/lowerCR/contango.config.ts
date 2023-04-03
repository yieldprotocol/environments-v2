import { parseUnits } from 'ethers/lib/utils'
import { YIELD_SPACE_MULTI_ORACLE } from '../../../../../shared/constants'
import { getName, readAddressMappingIfExists } from '../../../../../shared/helpers'
import { ASSETS_ARBITRUM, SERIES_ARBITRUM } from '../../contango-seed-config'
import * as base_config from '../../../base.arb_mainnet.config'
import { Ilk } from '../../../confTypes'

export const developer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'
export const deployers = readAddressMappingIfExists('deployers.json')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

export const ilks: Ilk[] = ASSETS_ARBITRUM.map((asset) =>
  SERIES_ARBITRUM.filter((series) => series.asset.code !== asset.code).map((series) => {
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
        oracle: protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE),
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
