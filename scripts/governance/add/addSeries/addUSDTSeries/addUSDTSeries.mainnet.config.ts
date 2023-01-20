import { BigNumber } from 'ethers'
import {
  ACCUMULATOR,
  CHI,
  DAI,
  EOJUN22,
  EOSEP22,
  ETH,
  FYUSDT2212,
  FYUSDT2303,
  ONE64,
  RATE,
  secondsInOneYear,
  FRAX,
  USDC,
  EWETH,
  WBTC,
  LINK,
  STETH,
  WSTETH,
  ENS,
  UNI,
  WAD,
  YSUSDT6MMS,
  YSUSDT6MJD,
  USDT,
  EUSDT,
  ZERO,
  COMPOUND,
  EOMAR23,
  EODEC22,
  CHAINLINK,
  FYETH2206,
  FYUSDC2206,
  FYDAI2206,
  FYDAI2209,
  FYETH2209,
  FYUSDC2209,
  YIELDMATH,
  LADLE,
  ONEUSDC,
} from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const deployer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const whales: Map<string, string> = base_config.whales
export const eulerAddress = base_config.eulerAddress
export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const newFYTokens = readAddressMappingIfExists('newFYTokens.json')
export const newJoins = readAddressMappingIfExists('newJoins.json')
export const newPools = readAddressMappingIfExists('newPools.json')
export const newStrategies = readAddressMappingIfExists('newStrategies.json')
export const protocol = () => readAddressMappingIfExists('protocol.json')

import { Accumulator, OracleSource, OraclePath, Asset } from '../../../confTypes'

const ONEUSDT = ONEUSDC

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
export const assetsToAdd: Map<string, string> = new Map([[USDT, assets.get(USDT) as string]])

export const timeStretch: Map<string, BigNumber> = new Map([
  [FYUSDT2212, ONE64.div(secondsInOneYear.mul(45))],
  [FYUSDT2303, ONE64.div(secondsInOneYear.mul(45))],
]) // todo: Allan

// Sell base to the pool fee, as fp4
export const g1: number = 9000 // todo: Allan

// ----- ORACLES -----

/// @notice Configuration of the acummulator
/// @param Asset identifier (bytes6 tag)
/// @param Acummulator type (bytes6 tag)
/// @param start Initial value for the acummulator (18 decimal fixed point)
/// @param increasePerSecond Acummulator multiplier, per second (18 decimal fixed point)
export const accumulators: Accumulator[] = [
  {
    baseId: USDT,
    kind: RATE,
    startRate: WAD,
    perSecondRate: BigNumber.from('1000000001546067000'),
  },
  {
    baseId: USDT,
    kind: CHI,
    startRate: WAD,
    perSecondRate: WAD,
  },
]

/// @notice Sources that will be added to the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Address for the base asset
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the quote asset
/// @param Address for the chainlink aggregator
export const chainlinkSources: OracleSource[] = [
  {
    baseId: USDT,
    baseAddress: assets.getOrThrow(USDT)!,
    quoteId: ETH,
    quoteAddress: assets.getOrThrow(ETH)!,
    sourceAddress: '0x14d04Fff8D21bd62987a5cE9ce543d2F1edF5D3E',
  },
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: OracleSource[] = [
  {
    baseId: USDT,
    baseAddress: '', // TODO: Is this the best way of ignoring this?
    quoteId: ETH,
    quoteAddress: '',
    sourceAddress: protocol().getOrThrow(CHAINLINK)!,
  },
]

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const compositePaths: OraclePath[] = [
  {
    baseId: USDT,
    quoteId: ENS,
    path: [ETH],
  },
  {
    baseId: USDT,
    quoteId: WSTETH,
    path: [ETH, STETH],
  },
]

// ----- ASSETS, BASES, ILKS -----

export const usdt: Asset = {
  assetId: USDT,
  address: assets.getOrThrow(USDT)!,
}

/// @notice Oracles that will be used for Chi
/// @param Asset identifier (bytes6 tag)
/// @param Address for the chi oracle
export const newChiSources: Array<[string, string]> = [[USDT, protocol().get(ACCUMULATOR) as string]]

/// @notice Oracles that will be used for Rate
/// @param Asset identifier (bytes6 tag)
/// @param Address for the rate oracle
export const newRateSources: Array<[string, string]> = [[USDT, protocol().get(ACCUMULATOR) as string]]

/// @notice Assets that will be made into a base
/// @param Asset identifier (bytes6 tag)
/// @param Address for the related Join
export const bases: Array<[string, string]> = [[USDT, newJoins.get(USDT) as string]]

/// @notice Configure an asset as an ilk for a base using the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, in terms of base, modified by decimals
/// @param Minimum vault debt, in terms of base, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newChainlinkLimits: Array<[string, string, number, number, number, number]> = [
  [USDT, DAI, 1100000, 100000, 1000, 6],
  [USDT, ETH, 1400000, 100000, 1000, 6],
  [USDT, USDC, 1100000, 100000, 1000, 6],
  [USDT, WBTC, 1500000, 100000, 1000, 6],
  [USDT, LINK, 1670000, 100000, 1000, 6],
  [USDT, USDT, 1000000, 200000, 0, 6],
  [USDT, FRAX, 1150000, 100000, 1000, 6],
  [USDT, UNI, 1670000, 100000, 1000, 6],
]

// To be used with Chainlink and Composite oracle ilk proposals
// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
/// @notice Limits to be used in an auction
/// @param base identifier (bytes6 tag)
/// @param duration of auctions in seconds
/// @param initial percentage of the collateral to be offered (fixed point with 6 decimals)
/// @param Maximum concurrently auctionable for this asset, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to auction ceiling and minimum vault debt.
export const auctionLimits: Array<[string, number, number, number, number, number]> = []

/// @notice Configure an asset as an ilk for a base using the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newCompositeLimits: Array<[string, string, number, number, number, number]> = [
  [USDT, WSTETH, 1400000, 100000, 1000, 6],
  [USDT, ENS, 1670000, 100000, 1000, 6],
]
/// @notice Deploy fyToken series
/// @param series identifier (bytes6 tag)
/// @param underlying identifier (bytes6 tag)
/// @param Address for the chi oracle
/// @param Address for the related Join
/// @param Maturity in unix time (seconds since Jan 1, 1970)
/// @param Name for the series
/// @param Symbol for the series
// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  [
    FYUSDT2212,
    USDT,
    protocol().get(ACCUMULATOR) as string,
    newJoins.get(USDT) as string,
    EODEC22,
    'FYUSDT2212',
    'FYUSDT2212',
  ],
  // [FYUSDT2303, USDT, protocol.get(COMPOUND) as string, joins.get(USDT) as string, EOMAR23, 'FYUSDT2303', 'FYUSDT2303'],
]

/// @notice Deploy YieldSpace pools
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param base address
/// @param fyToken address
/// @param time stretch, in 64.64
/// @param g1, in 64.64
/// @param g2, in 64.64
export const ePoolData: Array<[string, string, string, string, BigNumber, string]> = [
  [
    FYUSDT2212,
    eulerAddress,
    assets.get(EUSDT) as string,
    newFYTokens.get(FYUSDT2212) as string,
    timeStretch.get(FYUSDT2212) as BigNumber,
    g1.toString(),
  ],
  // [
  //   FYUSDT2303,
  //   eulerAddress,
  //   assets.get(EUSDT) as string,
  //   newFYTokens.get(FYUSDT2303) as string,
  //   timeStretch.get(FYUSDT2303) as BigNumber,
  //   g1.toString(),
  // ],
]

/// @notice Pool initialization parameters
/// @param pool identifier, usually matching the series (bytes6 tag)
/// @param base identifier (bytes6 tag)
/// @param amount of base to initialize pool with
/// @param amount of fyToken to initialize pool with
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  [FYUSDT2212, USDT, ONEUSDT.mul(100), ZERO],
  // [FYUSDT2303, USDT, WAD.mul(100), ZERO],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYUSDT2212, [USDT, ETH, DAI, USDC, FRAX, WBTC, WSTETH, LINK, ENS, UNI]],
  // [FYUSDT2303, [USDT, ETH, DAI, USDC, FRAX, WBTC, WSTETH, LINK, ENS, UNI]],
]

/// @notice Deploy strategies
/// @param strategy name
/// @param strategy identifier (bytes6 tag)
/// @param Address for the related Join
/// @param Address for the related asset
export const strategiesData: Array<[string, string, string, string, string]> = [
  // name, symbol, baseId
  ['Yield Strategy USDT 6M Jun Dec', YSUSDT6MJD, USDT, newJoins.get(USDT) as string, assets.get(USDT) as string],
  // ['Yield Strategy USDT 6M Sep Mar', YSUSDT6MMS, USDT, newJoins.get(USDT) as string, assets.get(USDT) as string],
]

/// @notice Strategy initialization parameters
/// @param strategy identifier (bytes6 tag)
/// @param address of initial pool
/// @param series identifier (bytes6 tag)
/// @param amount of base to initialize strategy with
/// @param fix this is true unless it is a nonTv pool
export const strategiesInit: Array<[string, string, string, BigNumber, boolean]> = [
  // [strategyId, startPoolAddress, startPoolId, initAmount]
  [YSUSDT6MJD, newPools.get(FYUSDT2212) as string, FYUSDT2212, ONEUSDT.mul(100), true],
  // [YSUSDT6MMS, newPools.get(FYUSDT2303) as string, FYUSDT2303, WAD.mul(100)],
]
