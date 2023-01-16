import { parseUnits } from 'ethers/lib/utils'
import { ETH, FYETH2303, OSQTH, UNISWAP } from '../../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../../shared/helpers'
import * as base_config from '../../../../base.mainnet.config'

import { Asset, ContractDeployment, Ilk, Series } from '../../../../confTypes'
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales = base_config.whales
const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const governance = readAddressMappingIfExists('governance.json')
export const deployers = readAddressMappingIfExists('deployers.json')
export const joins = readAddressMappingIfExists('newJoins.json')
export const assets: Map<string, string> = base_config.assets
export const asset: Asset = { assetId: OSQTH, address: assets.getOrThrow(OSQTH) as string }

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'newJoins.json',
    name: OSQTH,
    contract: 'Join',
    args: [() => assets.getOrThrow(OSQTH)!],
  },
]

export const ilk: Ilk = {
  baseId: ETH,
  ilkId: asset.assetId,
  asset: asset,
  collateralization: {
    baseId: ETH,
    ilkId: asset.assetId,
    oracle: protocol().getOrThrow(UNISWAP)! as string,
    ratio: 1100000,
  },
  debtLimits: {
    baseId: ETH,
    ilkId: asset.assetId,
    line: 250,
    dust: 1,
    dec: 18,
  },
  auctionLineAndLimit: {
    baseId: ETH,
    ilkId: asset.assetId,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.78571429'), // 110 / 140
    max: parseUnits('1000'),
  },
}

export const series: Series[] = [
  {
    seriesId: FYETH2303,
    fyToken: { assetId: FYETH2303, address: fyTokens.get(FYETH2303) as string },
    ilks: [ilk],
  },
]

export const uniswapsources: [string, string, string, number][] = [
  [ETH, OSQTH, '0x82c427AdFDf2d245Ec51D8046b41c4ee87F0d29C', 10],
]
