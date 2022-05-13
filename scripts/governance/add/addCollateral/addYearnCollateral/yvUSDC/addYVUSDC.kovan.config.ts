import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, YVUSDC } from '../../../../../../shared/constants'
import { FYUSDC2203, FYUSDC2206 } from '../../../../../../shared/constants'

export const developer = '0xE7aa7AF667016837733F3CA3809bdE04697730eF'
export const deployer = '0xE7aa7AF667016837733F3CA3809bdE04697730eF'

export const assets: Map<string, string> = new Map([
  [USDC, '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [YVUSDC, '0x2381d065e83DDdBaCD9B4955d49D5a858AE5957B'],
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
