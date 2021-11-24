/**
 * @dev Input file for updateCeiling.ts
 */

import { ETH, USDC } from '../../../../shared/constants'

// Input data: baseId, ilkId, maxDebt
export const newMax: Array<[string, string, number]> = [
  [USDC, ETH, 1000000],
]

export const developerIfImpersonating = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

