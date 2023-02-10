import * as base_config from '../../base.mainnet.config'
import { Ilk } from '../../confTypes'

export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins

export const developer = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

/// @notice Limits to be used in an auction
/// @param Array of Ilk objects to update

/* NOTE: Change the ilks in the  base.mainnet.config.ts  file to update the limits, list the ones you wnat to change here */
export const newLimits: Ilk[] = [
  base_config.ilkUSDCFUSDC2303,
  base_config.ilkUSDCFUSDC2306,
  base_config.ilkDAIFDAI2303,
  base_config.ilkDAIFDAI2306,
]
