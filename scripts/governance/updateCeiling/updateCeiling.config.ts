/**
 * @dev Input file for updateCeiling.ts
 */

 import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS } from '../../../shared/constants'
   
 export const developer: Map<number, string> = new Map([
   [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
   [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
   [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
 ])
 
// Input data: baseId, ilkId, line
export const chainlinkLimits: Array<[string, string, number]> = [
  [DAI,  ETH, 2000000],
]

// Input data: baseId, ilkId, line
export const compositeLimits: Array<[string, string, number]> = [
  [DAI,  ENS, 2000000],
  [USDC, ENS, 2000000],
]

