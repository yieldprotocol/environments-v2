/**
 * @dev Input file for updateCeiling.ts
 */

 import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS } from '../../../shared/constants'
 import { CHAINLINK, COMPOSITE } from '../../../shared/constants'
  
 export const developer: Map<number, string> = new Map([
   [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
   [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
   [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
 ])
 
// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const chainlinkLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  ETH,  CHAINLINK, 1400000, 714000,  2000000,  1,   18],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  ENS,    COMPOSITE, 1670000, 600000, 2000000,  100, 18],
  [USDC, ENS,    COMPOSITE, 1670000, 600000, 2000000,  100, 6],
]


export const developerIfImpersonating = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

