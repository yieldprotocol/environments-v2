import { parseUnits } from 'ethers/lib/utils'
import { ETH, FYETH2303, RETH } from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import * as base_config from '../../../base.mainnet.config'

import { Asset, ContractDeployment, Ilk, Series } from '../../../confTypes'

const fyTokens = readAddressMappingIfExists('fyTokens.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const governance = () => readAddressMappingIfExists('governance.json')
export const joins = () => readAddressMappingIfExists('newjoins.json')
export const assets: Map<string, string> = base_config.assets
export const asset: Asset = { assetId: RETH, address: assets.getOrThrow(RETH) as string }
export const ilk: Ilk = {
  baseId: ETH,
  ilkId: asset.assetId,
  asset: asset,
  collateralization: {
    baseId: ETH,
    ilkId: asset.assetId,
    oracle: 'rethOracle',
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

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: 'rethOracle',
    contract: 'RETHOracle',
    args: [() => ETH, () => RETH, () => assets.getOrThrow(RETH)!],
  },
  {
    addressFile: 'newJoins.json',
    name: RETH,
    contract: 'Join',
    args: [() => assets.getOrThrow(RETH)!],
  },
]

export const series: Series[] = [
  {
    seriesId: FYETH2303,
    fyToken: { assetId: FYETH2303, address: fyTokens.get(FYETH2303) as string },
    ilks: [ilk],
  },
]
