import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC } from '../../../../shared/constants'

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Input data: ilkId, initialOffer, auctionLine, auctionDust, dec
export const newLimits: Array<[string, number, number, number, number]> = [
  [ETH, 714000, 3250000000, 1500000, 12],
  [DAI, 751000, 10000000, 5000, 18],
  [USDC, 751000, 10000000, 5000, 6],
  [WBTC, 666000, 2500000, 1200, 4],
  [WSTETH, 714000, 3250000000, 1500000, 12],
  [LINK, 600000, 600000, 300, 18],
  [ENS, 600000, 500000, 250, 18],
  [YVUSDC, 800000, 10000000, 5000, 6],
  [UNI, 600000, 1000000, 400, 18],
]
