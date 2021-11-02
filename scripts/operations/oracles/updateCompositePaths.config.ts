/**
 * @dev Input file for updateCompositePaths.ts
 */

import { ETH, DAI, USDC, WBTC, USDT } from '../../../shared/constants'

// Input data: baseId, quoteId, intermediate steps
export const newCompositePaths: Array<[string, string, Array<string>]> = [
  [DAI, USDC, [ETH]],
//  [WSTETH, DAI, [STETH, ETH]],
//  [WSTETH, USDC, [STETH, ETH]],
]