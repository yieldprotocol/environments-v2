import { BigNumber } from 'ethers'
import { WAD } from '../../../../../shared/constants'
import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC } from '../../../../../shared/constants'
import { FYETH2306, FYDAI2306, FYUSDC2306, FYFRAX2306 } from '../../../../../shared/constants'
import {
  YSETH6MJD,
  YSDAI6MJD,
  YSUSDC6MJD,
  YSFRAX6MJD,
  YSETH6MJD_V1,
  YSDAI6MJD_V1,
  YSUSDC6MJD_V1,
  YSFRAX6MJD_V1,
} from '../../../../../shared/constants'
import { FCASH, FETH2306, FDAI2306, FUSDC2306 } from '../../../../../shared/constants'
import { AuctionLineAndLimit } from '../../../confTypes' // Note we use the series id as the asset id

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const external: Map<string, string> = base_config.external
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const strategies: Map<string, string> = base_config.strategies
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, FETH2306]],
  [FYDAI2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, FDAI2306]],
  [FYUSDC2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC, FUSDC2306]],
  [FYFRAX2306, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
]

/// Parameters to roll each strategy
/// @param source strategy
/// @param seriesId(poolId) on the destination strategy
/// @param destination strategy
/// @param pool to invest in
export const migrateData: Array<[string, string, string, string]> = [
  [
    strategies.getOrThrow(YSETH6MJD_V1)!,
    FYETH2306,
    newStrategies.getOrThrow(YSETH6MJD)!,
    newPools.getOrThrow(FYETH2306)!,
  ],
  [
    strategies.getOrThrow(YSDAI6MJD_V1)!,
    FYDAI2306,
    newStrategies.getOrThrow(YSDAI6MJD)!,
    newPools.getOrThrow(FYDAI2306)!,
  ],
  [
    strategies.getOrThrow(YSUSDC6MJD_V1)!,
    FYUSDC2306,
    newStrategies.getOrThrow(YSUSDC6MJD)!,
    newPools.getOrThrow(FYUSDC2306)!,
  ],
  [
    strategies.getOrThrow(YSFRAX6MJD_V1)!,
    FYFRAX2306,
    newStrategies.getOrThrow(YSFRAX6MJD)!,
    newPools.getOrThrow(FYFRAX2306)!,
  ],
]

/// @dev The Notional Oracle is fed with Yield Protocol asset pairs to register.
/// Since we are valuing the fCash at face value, we don't need the Notional fCash ids.
/// Note: notionalId (FDAI2203) is the id of an fCash tenor in the Yield Protocol,
/// while fCashId (FDAI2203ID) is the id of that same tenor in Notional Finance
/// @param fcash: address of the fCash contract
/// @param notionalId: asset id of an fCash tenor in the Yield Protocol
/// @param underlyingId: asset id of a borrowable asset in the Yield Protocol
/// @param underlying: contract address matching underlyingId
export const notionalSources: Array<[string, string, string, string]> = [
  [external.getOrThrow(FCASH)!, FETH2306, ETH, assets.get(ETH) as string],
  [external.getOrThrow(FCASH)!, FDAI2306, DAI, assets.get(DAI) as string],
  [external.getOrThrow(FCASH)!, FUSDC2306, USDC, assets.get(USDC) as string],
]

/// @dev Collateralization ratio, debt ceiling, and debt dust
/// @param baseId: asset id of a borrowable asset
/// @param ilkId: asset id of a collateral asset
/// @param ratio: collateralization ratio for the base/ilk pair, with 1000000 == 100%
/// @param line: maximum debt across the protocol for the pair, with added dec
/// @param dust: minimum debt in any given vault for the pair, with added dec
/// @param dec: number of zeros to append to line and dust
export const notionalDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, FETH2306, 1100000, 400, 1, 18],
  [DAI, FDAI2306, 1100000, 500000, 1000, 18],
  [USDC, FUSDC2306, 1100000, 500000, 1000, 6],
]

/// @dev Parameters to govern liquidations
export const auctionLineAndLimits: AuctionLineAndLimit[] = []

/// Strategies to print redeemable and available funds for.
export const rollData: Array<string> = [YSETH6MJD_V1, YSDAI6MJD_V1, YSUSDC6MJD_V1, YSFRAX6MJD_V1]

// Amount to be donated to the Joins in forks
export const joinLoans: Map<string, BigNumber> = new Map([[FRAX, WAD.mul(5000)]])
