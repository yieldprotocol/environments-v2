/**
 * @dev Input file for updateDust.ts
 */

import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS } from '../../../shared/constants'

export const developer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

// Input data: baseId, ilkId, line, dust, dec
export const newMin: Array<[string, string, number]> = [
  [DAI, ETH, 5000],
  [DAI, USDC, 5000], // Via ETH
  [DAI, WBTC, 5000], // Via ETH
  [DAI, LINK, 5000],
  [USDC, ETH, 5000],
  [USDC, DAI, 5000], // Via ETH
  [USDC, WBTC, 5000], // Via ETH
  [USDC, LINK, 5000],
  [DAI, WSTETH, 5000],
  [USDC, WSTETH, 5000],
  [DAI, ENS, 5000],
  [USDC, ENS, 5000],
]
