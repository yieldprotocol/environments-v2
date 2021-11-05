/**
 * @dev 
 */

import { DAI, USDC, WSTETH } from '../../shared/constants'

const CHAINLINK = 'chainlinkOracle'
const CTOKEN = 'cTokenOracle'
const COMPOSITE = 'compositeOracle'

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const newIlks: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 18],
  [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 6],
]
