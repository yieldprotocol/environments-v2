import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, YVUSDC } from '../../../shared/constants'
   
export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

// Input data: ilkId, auctionLine, auctionDust, dec
export const newLimits: Array<[string, number, number, number]> = [
  [ETH,    500000000, 10000, 12],
  [DAI,    1000000,   5000,  18],
  [USDC,   1000000,   5000,  6],
  [WBTC,   300000,    2100,  4],
  [WSTETH, 500000,    10000, 12],
  [LINK,   1000000,   300,   18],
  [ENS,    2000000,   300,   18],
  [YVUSDC, 1000000,   5000,  18],
  [UNI,    1000000,   100,   18],
]


// Input data: ilkId, initialOffer
export const newInitialOffer: Array<[string, number]> = [
  [ETH,    714000],
  [DAI,    751000],
  [USDC,   751000],
  [WBTC,   666000],
  [WSTETH, 714000],
  [LINK,   600000],
  [ENS,    600000],
  [YVUSDC, 800000],
  [UNI,    600000],
]
