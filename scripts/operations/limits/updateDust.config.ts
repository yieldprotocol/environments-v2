/**
 * @dev Input file for updateDust.ts
 */

import { ETH, DAI, USDC, WBTC } from '../../../shared/constants'

// Input data: baseId, ilkId, maxDebt
export const newMin: Array<[string, string, number]> = [
  [DAI, ETH, 1000],
  [USDC, ETH, 1000],
]