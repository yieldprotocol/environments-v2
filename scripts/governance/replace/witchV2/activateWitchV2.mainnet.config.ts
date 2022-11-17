import { parseUnits } from 'ethers/lib/utils'

import * as base_config from '../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins

export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

import {
  ETH,
  DAI,
  USDC,
  FRAX,
  FYETH2212,
  FYUSDC2212,
  FYFRAX2212,
  FYETH2303,
  FYUSDC2303,
  FYFRAX2303,
  CAULDRON,
  LADLE,
  WITCH,
} from '../../../../shared/constants'
import { AuctionLineAndLimit, ContractDeployment } from '../../confTypes' // Note we use the series id as the asset id

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: WITCH,
    contract: 'Witch',
    args: [() => protocol().getOrThrow(CAULDRON), () => protocol().getOrThrow(LADLE)],
  },
]

// ----- proposal parameters -----

/// The Witch v2 will accept payment in these fyToken
export const seriesIds: Array<string> = [FYETH2212, FYUSDC2212, FYFRAX2212, FYETH2303, FYUSDC2303, FYFRAX2303]

/// Auction configuration for each asset pair
/// @param baseId assets in scope as underlying for vaults to be auctioned
/// @param ilkId assets in scope as collateral for vaults to be auctioned
/// @param duration time that it takes for the auction to offer maximum collateral
/// @param vaultProportion proportion of a vault that will be auctioned at a time
/// @param collateralProportion proportion of the collateral that will be paid out
/// at the begining of an auction
/// @param max If the aggregated collateral under auction for vaults of this pair
/// exceeds this number, no more auctions of for this pair can be started.
export const v2Limits: AuctionLineAndLimit[] = [
  // DAI
  {
    baseId: ETH,
    ilkId: DAI,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.75'), // 105 / 140
    max: parseUnits('1000000'),
  },
  {
    baseId: USDC,
    ilkId: DAI,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
  {
    baseId: FRAX,
    ilkId: DAI,
    duration: 600,
    vaultProportion: parseUnits('1'),
    collateralProportion: parseUnits('0.9545454545'), // 105 / 110
    max: parseUnits('1000000'),
  },
]
