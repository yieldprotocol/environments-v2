/**
 * @dev 
 */

import { ETH, STETH } from '../../../shared/constants'

// baseId, base.address, quoteId, quote.address, oracleName, source.address
export const newSpotSources: Array<[string, string, string, string, string, string]> = [
    [STETH, '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', ETH, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 'chainlinkOracle',  '0x545C84A9799dA0c906f3e22595b5d53c9275b9d9'],
  ]
