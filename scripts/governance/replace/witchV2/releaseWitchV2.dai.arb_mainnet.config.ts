import { parseUnits } from 'ethers/lib/utils'

import * as base_config from '../../base.arb_mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

import { ETH, DAI, USDC, FYETH2212, FYUSDC2212, FYETH2303, FYUSDC2303 } from '../../../../shared/constants'
import { AuctionLineAndLimit } from '../../confTypes' // Note we use the series id as the asset id

export const seriesIds: Array<string> = [FYETH2212, FYUSDC2212, FYETH2303, FYUSDC2303]

export const v2Limits: AuctionLineAndLimit[] = [
  // DAI
  {
    baseId: DAI,
    ilkId: ETH,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('500'),
  },
  {
    baseId: DAI,
    ilkId: USDC,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
]
