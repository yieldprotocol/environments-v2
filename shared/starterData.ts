import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  STETH,
  LINK,
  ENS,
  UNI,
  YVUSDC,
  CVX3CRV,
  FYDAI2203,
  FYDAI2206,
  FYUSDC2203,
  FYUSDC2206,
} from '../shared/constants'
import { AssetEntity, SeriesEntity } from './types'

export const assets: AssetEntity[] = [
  { assetId: ETH, address: '', deploymentTime: '' },
  { assetId: DAI, address: '', deploymentTime: '' },
  { assetId: USDC, address: '', deploymentTime: '' },
  { assetId: WBTC, address: '', deploymentTime: '' },
  { assetId: WSTETH, address: '', deploymentTime: '' },
  { assetId: STETH, address: '', deploymentTime: '' },
  { assetId: LINK, address: '', deploymentTime: '' },
  { assetId: ENS, address: '', deploymentTime: '' },
  { assetId: YVUSDC, address: '', deploymentTime: '' },
  { assetId: UNI, address: '', deploymentTime: '' },
]

export const series: SeriesEntity[] = [
  { seriesId: FYDAI2203, fyToken: '', baseId: '', maturity: '' },
  { seriesId: FYUSDC2203, fyToken: '', baseId: '', maturity: '' },
  { seriesId: FYDAI2206, fyToken: '', baseId: '', maturity: '' },
  { seriesId: FYUSDC2206, fyToken: '', baseId: '', maturity: '' },
]
