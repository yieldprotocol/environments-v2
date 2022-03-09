import { USDC, YVUSDC } from '../../../../shared/constants'
import { FYUSDC2203, FYUSDC2206 } from '../../../../shared/constants'

export const developer = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const deployer = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'

export const assets: Map<string, string> = new Map([
  [USDC, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  [YVUSDC, '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE'],
])

// underlying, yvToken, address
export const yearnSources: Array<[string, string, string]> = [[USDC, YVUSDC, assets.get(YVUSDC) as string]]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [[YVUSDC, assets.get(YVUSDC) as string]]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), line, dust, dec
export const debtLimits: Array<[string, string, number, number, number, number]> = [
  [USDC, YVUSDC, 1250000, 1000000, 5000, 6],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, ilkDec
export const auctionLimits: Array<[string, number, number, number, number, number]> = [
  [YVUSDC, 3600, 600000, 1000000, 2, 18],
]

// Input data: seriesId, [ilkIds]
export const seriesIlks: Array<[string, string[]]> = [
  [FYUSDC2203, [YVUSDC]],
  [FYUSDC2206, [YVUSDC]],
]
