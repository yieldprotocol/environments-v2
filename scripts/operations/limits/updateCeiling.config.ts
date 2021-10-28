/**
 * @dev Input file for updateCeiling.ts
 */

import { ETH, DAI, USDC, WBTC, USDT } from '../../../shared/constants'

// Input data: baseId, ilkId, maxDebt
export const newMax: Array<[string, string, number]> = [
  [DAI, ETH, 500000],
  [USDC, ETH, 500000],
]