/**
 * @dev Input file for ypp-0009.ts
 */

import { ETH, DAI, USDC, WBTC, WSTETH } from '../../../../shared/constants'

// Input data: baseId, ilkId, maxDebt, minDebt, dec
export const newLimits: Array<[string, string, number, number, number]> = [
  [ETH, DAI,    250000000, 10000, 12],
  [ETH, WSTETH, 250000000, 10000, 12],
  [ETH, USDC,   250000000, 10000, 12],
  [ETH, WBTC,   250000000, 10000, 12],
]

