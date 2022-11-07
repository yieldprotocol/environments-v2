import { CRAB, ETH, FYETH2212, OSQTH } from '../../../../../shared/constants'
import { AuctionLineAndLimit, ContractDeployment } from '../../../confTypes'
import * as base_config from '../../../base.mainnet.config'

export const assets: Map<string, string> = base_config.assets
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const newJoins: Map<string, string> = base_config.newJoins

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: CRAB,
    contract: 'FlashJoin',
    args: [assets.get(CRAB)!],
  },
]

export const crabOracleSource: [string, string, string, string] = [
  CRAB,
  OSQTH,
  assets.get(CRAB) as string,
  protocol.get('uniswapOracle') as string,
]

/// @notice Configure an asset as an ilk for a base using the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newCrabLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, CRAB, 1100000, 1000000, 5000, 18],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [[FYETH2212, [CRAB]]]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param duration of auctions in seconds
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const strategyAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [CRAB, 3600, 1000000, 1000000, 5000, 18],
]
