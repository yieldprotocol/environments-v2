import { CVX3CRV, DAI, USDC, WSTETH } from '../../../../../shared/constants'
import { FYDAI2203, FYDAI2206, FYUSDC2203, FYUSDC2206, EOMAR22, EOJUN22 } from '../../../../../shared/constants'
import { AssetEntity, SeriesEntity } from '../../../../../shared/types'
export const { assets, developer, deployer } = require(process.env.BASE as string)

// export const assetsToAdd: Array<[string, string]> = [[CVX3CRV, assets.get(CVX3CRV) as string]]

export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2203, [CVX3CRV]],
  [FYUSDC2203, [CVX3CRV]],
  [FYDAI2206, [CVX3CRV]],
  [FYUSDC2206, [CVX3CRV]],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const debtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, CVX3CRV, 1670000, 1000000, 5000, 18],
  [USDC, CVX3CRV, 1670000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
export const auctionLimits: Array<[string, number, number, number, number, number]> = [
  [CVX3CRV, 3600, 600000, 1000000, 2, 18],
]

export const compositeDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, WSTETH, 1400000, 500000, 5000, 18],
  [USDC, WSTETH, 1400000, 500000, 5000, 6],
]

export const assetsToAdd: AssetEntity[] = [{ assetId: CVX3CRV, address: assets.get(CVX3CRV), deploymentTime: '' }]
