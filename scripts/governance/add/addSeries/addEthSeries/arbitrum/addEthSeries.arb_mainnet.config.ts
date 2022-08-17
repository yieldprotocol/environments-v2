import { BigNumber } from 'ethers'
import {
  ACCUMULATOR,
  CHI,
  DAI,
  EOSEP22,
  ETH,
  FYETH2209,
  ONE64,
  RATE,
  secondsIn40Years,
  USDC,
  WAD,
  YSETH6MMS,
  ZERO,
} from '../../../../../../shared/constants'

import * as base_config from '../../../../base.arb_mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales.set(ETH, '0x489ee077994b6658eafa855c308275ead8097c4a')

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

/// @notice Configuration of the acummulator
/// @param Asset identifier (bytes6 tag)
/// @param Acummulator type (bytes6 tag)
/// @param start Initial value for the acummulator (18 decimal fixed point)
/// @param increasePerSecond Acummulator multiplier, per second (18 decimal fixed point)
export const rateChiSources: Array<[string, string, string, string]> = [
  [ETH, RATE, WAD.toString(), WAD.toString()],
  [ETH, CHI, WAD.toString(), WAD.toString()],
]

// Assets that will be made into a base
export const bases: Array<[string, string]> = [[ETH, base_config.joins.get(ETH) as string]]

/// @notice Configure an asset as an ilk for a base using the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, DAI, 1400000, 1000000000, 25000, 12],
  [ETH, USDC, 1400000, 1000000000, 25000, 12],
  [ETH, ETH, 1000000, 2500000000, 0, 12], // Constant 1, no dust
]

/// @notice Deploy fyToken series
/// @param series identifier (bytes6 tag)
/// @param underlying identifier (bytes6 tag)
/// @param Address for the chi oracle
/// @param Address for the related Join
/// @param Maturity in unix time (seconds since Jan 1, 1970)
/// @param Name for the series
/// @param Symbol for the series
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [FYETH2209, ETH, protocol.get(ACCUMULATOR) as string, joins.get(ETH) as string, EOSEP22, 'FYETH2209', 'FYETH2209'],
]

/// @notice Deploy YieldSpace pools
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param base address
/// @param fyToken address
/// @param time stretch, in 64.64
/// @param g1, in 64.64
/// @param g2, in 64.64
export const poolData: Array<[string, string, string, BigNumber, BigNumber, BigNumber]> = [
  [
    FYETH2209,
    assets.get(ETH) as string,
    newFYTokens.get(FYETH2209) as string,
    ONE64.div(secondsIn40Years),
    ONE64.mul(75).div(100),
    ONE64.mul(100).div(75),
  ],
]

/// @notice Pool initialization parameters
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param base identifier (bytes6 tag)
/// @param amount of base to initialize pool with
/// @param amount of fyToken to initialize pool with
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [[FYETH2209, ETH, WAD.div(50), ZERO]]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [[FYETH2209, [ETH, DAI, USDC]]]

/// @notice Deploy strategies
/// @param strategy name
/// @param strategy identifier (bytes6 tag)
/// @param base
/// @param Address for the related Join
/// @param Address for the related asset
export const strategiesData: Array<[string, string, string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy ETH 6M Mar Sep', YSETH6MMS, ETH, joins.get(ETH) as string, assets.get(ETH) as string],
]

/// @notice Strategy initialization parameters
/// @param strategy identifier (bytes6 tag)
/// @param address of initial pool
/// @param series identifier (bytes6 tag)
/// @param amount of base to initialize strategy with
export const strategiesInit: Array<[string, string, string, BigNumber]> = [
  // [strategyId, startPoolAddress, startPoolId, initAmount]
  [YSETH6MMS, newPools.get(FYETH2209) as string, FYETH2209, WAD.div(50)],
]
