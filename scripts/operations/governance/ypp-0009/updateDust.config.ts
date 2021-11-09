/**
 * @dev Input file for ypp-0009.ts
 */

import { ETH, DAI, USDC, WBTC, WSTETH } from '../../../../shared/constants'

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
