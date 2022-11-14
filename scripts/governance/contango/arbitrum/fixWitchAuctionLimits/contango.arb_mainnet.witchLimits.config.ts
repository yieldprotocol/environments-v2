import { parseUnits } from 'ethers/lib/utils'

import {
  DAI,
  ETH,
  FYDAI2212,
  FYDAI2303,
  FYETH2212,
  FYETH2303,
  FYUSDC2212,
  FYUSDC2303,
  USDC,
} from '../../../../../shared/constants'
import * as base_config from '../../../base.arb_mainnet.config'
import { AuctionLineAndLimit } from '../../../confTypes' // Note we use the series id as the asset id

export const developer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'
export const deployer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

export const auctionLineAndLimits: AuctionLineAndLimit[] = [
  // ETH
  {
    baseId: ETH,
    ilkId: FYUSDC2212,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000', 6),
  },
  {
    baseId: ETH,
    ilkId: FYDAI2212,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000'),
  },
  {
    baseId: ETH,
    ilkId: FYUSDC2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000', 6),
  },
  {
    baseId: ETH,
    ilkId: FYDAI2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000'),
  },

  // USDC
  {
    baseId: USDC,
    ilkId: FYETH2212,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: USDC,
    ilkId: FYDAI2212,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
  {
    baseId: USDC,
    ilkId: FYETH2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: USDC,
    ilkId: FYDAI2303,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },

  // DAI
  {
    baseId: DAI,
    ilkId: FYETH2212,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: DAI,
    ilkId: FYUSDC2212,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000', 6),
  },
  {
    baseId: DAI,
    ilkId: FYETH2303,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: DAI,
    ilkId: FYUSDC2303,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000', 6),
  },
]
