/**
 * @dev Input file for updateCompositePairs.ts
 */

import { ETH, DAI, USDC, WBTC, WSTETH, STETH } from '../../../shared/constants'

// Input data: baseId, quoteId, oracle name
export const newCompositePairs: Array<[string, string, string]> = [
  [DAI, ETH, 'chainlinkOracle'],
  [USDC, ETH, 'chainlinkOracle'],
  [WBTC, ETH, 'chainlinkOracle'],
  [STETH, ETH, 'chainlinkOracle'],
  [WSTETH, STETH, 'lidoOracle'],
]