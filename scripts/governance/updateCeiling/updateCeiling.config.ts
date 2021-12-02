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
  [DAI,  ETH,  CHAINLINK, 1400000, 714000,  5000000,  1,   18],
  [DAI,  DAI,  CHAINLINK, 1000000, 1000000, 20000000, 0,   18], // Constant 1, no dust
  [DAI,  USDC, CHAINLINK, 1330000, 751000,  1000000,  1,   18], // Via ETH
  [DAI,  WBTC, CHAINLINK, 1500000, 666000,  1000000,  1,   18], // Via ETH
  [DAI,  LINK, CHAINLINK, 1670000, 1000000, 1000000,  100, 18],
  [USDC, ETH,  CHAINLINK, 1400000, 714000,  5000000,  1,   6],
  [USDC, DAI,  CHAINLINK, 1330000, 751000,  1000000,  1,   6], // Via ETH
  [USDC, USDC, CHAINLINK, 1000000, 1000000, 20000000, 0,   6], // Constant 1, no dust
  [USDC, WBTC, CHAINLINK, 1500000, 666000,  1000000,  1,   6], // Via ETH  
  [USDC, LINK, CHAINLINK, 1670000, 1000000, 1000000,  100, 6],
]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  WSTETH, COMPOSITE, 1400000, 714000, 1000000,  1,   18],
  [USDC, WSTETH, COMPOSITE, 1400000, 714000, 1000000,  1,   6],
  [DAI,  ENS,    COMPOSITE, 1670000, 600000, 2000000,  100, 18],
  [USDC, ENS,    COMPOSITE, 1670000, 600000, 2000000,  100, 6],
]


export const developerIfImpersonating = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

