/**
 * @dev Input file for ypp-0009.ts
 */

import { ETH, DAI, USDC, WBTC, WSTETH } from '../../../shared/constants'

// Input data: baseId, ilkId, maxDebt
export const newMin: Array<[string, string, number]> = [
  [DAI, ETH, 100],
  [DAI, WSTETH, 100],
  [DAI, USDC, 100],
  [DAI, WBTC, 100],
  [USDC, ETH, 100],
  [USDC, WSTETH, 100],
  [USDC, DAI, 100],
  [USDC, WBTC, 100],
]

export const linkAddress = new Map([
  [1, '0x514910771af9ca656af840dff83e8264ecf986ca'],
  [42, '0xe37c6209C44d89c452A422DDF3B71D1538D58b96'],
])

export const developerIfImpersonating = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])
