/**
 * @dev Input file for updateCompositePaths.ts
 */

import { ETH, DAI, USDC, WSTETH, STETH } from '../../../shared/constants'

// Input data: baseId, quoteId, intermediate steps
export const newCompositePaths: Array<[string, string, Array<string>]> = [
  [WSTETH, DAI, [STETH, ETH]],
  [WSTETH, USDC, [STETH, ETH]],
]