 import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI } from '../../../shared/constants'
   
 export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
 
export const newLimits: Array<[string, number, number, number]> = [
  [ETH,    1000000, 1,    18],
  [DAI,    1000000, 5000, 18],
  [USDC,   1000000, 5000, 6],
  [WBTC,   1000000, 2100, 0],
  [WSTETH, 1000000, 1,    18],
  [LINK,   1000000, 300,  18],
  [ENS,    1000000, 300,  18],
  [UNI,    1000000, 100,  18]
]
