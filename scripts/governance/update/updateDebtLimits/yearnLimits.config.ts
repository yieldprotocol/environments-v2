import { CHAINLINK, CHAINLINKUSD, USDC, YVUSDC } from '../../../../shared/constants'
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

const ilkUSDCYVUSDC: Ilk = {
  baseId: USDC,
  ilkId: YVUSDC,
  asset: {
    assetId: YVUSDC,
    address: assets.getOrThrow(YVUSDC)!,
  },
  collateralization: {
    baseId: USDC,
    ilkId: YVUSDC,
    oracle: protocol.getOrThrow(CHAINLINK)!,
    ratio: 1000000,
  },
  debtLimits: {
    baseId: USDC,
    ilkId: YVUSDC,
    line: 0,
    dust: 0,
    dec: 6,
  },
  // No auction line and limit for USDC/USDC
}

/* NOTE: Change the ilks in the  base.mainnet.config.ts  file to update the limits, list the ones you wnat to change here */
export const newLimits: Ilk[] = [ilkUSDCYVUSDC]
