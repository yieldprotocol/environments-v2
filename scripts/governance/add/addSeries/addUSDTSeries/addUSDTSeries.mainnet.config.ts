import { BigNumber } from 'ethers'
import { WAD, ONEUSDC, ONEWBTC, ZERO, CHI, RATE, FYUSDT2303, FYUSDT2306 } from '../../../../../shared/constants'
import { ACCUMULATOR, CHAINLINK, COMPOSITE } from '../../../../../shared/constants'
import { ETH, DAI, FRAX, USDC, WBTC, LINK, STETH, WSTETH, ENS, UNI, USDT } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const deployer: string = '0x9152F1f95b0819DA526BF6e0cB800559542b5b25'
export const whales: Map<string, string> = base_config.whales
export const eulerAddress = base_config.eulerAddress
export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategies: Map<string, string> = base_config.strategies

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const protocol = () => readAddressMappingIfExists('protocol.json')

import { Accumulator, OracleSource, OraclePath, Asset, Base, Ilk, Series } from '../../../confTypes'

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

export const usdt: Base = {
  asset: {
    assetId: USDT,
    address: assets.getOrThrow(USDT)!,
  },
  rateOracle: protocol().getOrThrow(ACCUMULATOR)!,
}

export const ilks: Ilk[] = [
  {
    baseId: USDT,
    ilkId: ETH,
    asset: {
      assetId: ETH,
      address: assets.getOrThrow(ETH)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: ETH,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1400000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: ETH,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: ETH,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(1000), // $10M
    },
  },

  {
    baseId: USDT,
    ilkId: DAI,
    asset: {
      assetId: DAI,
      address: assets.getOrThrow(DAI)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: DAI,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1100000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: DAI,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: DAI,
      duration: 3600,
      vaultProportion: WAD,
      collateralProportion: WAD.mul(1050000).div(1100000),
      max: WAD.mul(10000000),
    },
  },

  {
    baseId: USDT,
    ilkId: USDC,
    asset: {
      assetId: USDC,
      address: assets.getOrThrow(USDC)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: USDC,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1100000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: USDC,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: USDC,
      duration: 3600,
      vaultProportion: WAD,
      collateralProportion: WAD.mul(1050000).div(1100000),
      max: ONEUSDC.mul(10000000),
    },
  },

  {
    baseId: USDT,
    ilkId: WBTC,
    asset: {
      assetId: WBTC,
      address: assets.getOrThrow(WBTC)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: WBTC,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1500000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: WBTC,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: WBTC,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1500000),
      max: ONEWBTC.mul(1000),
    },
  },

  {
    baseId: USDT,
    ilkId: LINK,
    asset: {
      assetId: LINK,
      address: assets.getOrThrow(LINK)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: LINK,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1670000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: LINK,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: LINK,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1670000),
      max: WAD.mul(100000),
    },
  },

  {
    baseId: USDT,
    ilkId: USDT,
    asset: {
      assetId: USDT,
      address: assets.getOrThrow(USDT)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: USDT,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1000000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: LINK,
      line: 100000000,
      dust: 0,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: USDT,
      duration: 3600,
      vaultProportion: ZERO,
      collateralProportion: ZERO,
      max: ZERO,
    },
  },

  {
    baseId: USDT,
    ilkId: FRAX,
    asset: {
      assetId: FRAX,
      address: assets.getOrThrow(FRAX)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: FRAX,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1150000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: FRAX,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: FRAX,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1150000),
      max: WAD.mul(10000000),
    },
  },

  {
    baseId: USDT,
    ilkId: UNI,
    asset: {
      assetId: UNI,
      address: assets.getOrThrow(UNI)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: UNI,
      oracle: protocol().getOrThrow(CHAINLINK)!,
      ratio: 1670000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: UNI,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: UNI,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1670000),
      max: WAD.mul(100000),
    },
  },

  {
    baseId: USDT,
    ilkId: WSTETH,
    asset: {
      assetId: WSTETH,
      address: assets.getOrThrow(WSTETH)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: WSTETH,
      oracle: protocol().getOrThrow(COMPOSITE)!,
      ratio: 1400000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: WSTETH,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: WSTETH,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(10000),
    },
  },

  {
    baseId: USDT,
    ilkId: ENS,
    asset: {
      assetId: ENS,
      address: assets.getOrThrow(ENS)!,
    },
    collateralization: {
      baseId: USDT,
      ilkId: ENS,
      oracle: protocol().getOrThrow(COMPOSITE)!,
      ratio: 1670000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: ENS,
      line: 100000,
      dust: 1000,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: ENS,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1670000),
      max: WAD.mul(10000),
    },
  },
]

/// ----- SERIES -----

export const series: Series[] = [
  {
    seriesId: FYUSDT2303,
    base: usdt.asset,
    fyToken: {
      assetId: FYUSDT2303,
      address: fyTokens.getOrThrow(FYUSDT2303)!,
    },
    chiOracle: protocol().getOrThrow(ACCUMULATOR)!,
    ilks: ilks,
  },
  {
    seriesId: FYUSDT2306,
    base: usdt.asset,
    fyToken: {
      assetId: FYUSDT2306,
      address: fyTokens.getOrThrow(FYUSDT2306)!,
    },
    chiOracle: protocol().getOrThrow(ACCUMULATOR)!,
    ilks: ilks,
  },
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
// export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
//   [
//     FYUSDT2212,
//     USDT,
//     protocol().get(ACCUMULATOR) as string,
//     newJoins.get(USDT) as string,
//     EODEC22,
//     'FYUSDT2212',
//     'FYUSDT2212',
//   ],
//   // [FYUSDT2303, USDT, protocol.get(COMPOUND) as string, joins.get(USDT) as string, EOMAR23, 'FYUSDT2303', 'FYUSDT2303'],
// ]
//
// /// @notice Deploy YieldSpace pools
// /// @param pool identifier, usually matching the series (bytes6 tag)
// /// @param base address
// /// @param fyToken address
// /// @param time stretch, in 64.64
// /// @param g1, in 64.64
// /// @param g2, in 64.64
// export const ePoolData: Array<[string, string, string, string, BigNumber, string]> = [
//   [
//     FYUSDT2212,
//     eulerAddress,
//     assets.get(EUSDT) as string,
//     newFYTokens.get(FYUSDT2212) as string,
//     timeStretch.get(FYUSDT2212) as BigNumber,
//     g1.toString(),
//   ],
//   // [
//   //   FYUSDT2303,
//   //   eulerAddress,
//   //   assets.get(EUSDT) as string,
//   //   newFYTokens.get(FYUSDT2303) as string,
//   //   timeStretch.get(FYUSDT2303) as BigNumber,
//   //   g1.toString(),
//   // ],
// ]
//
// /// @notice Pool initialization parameters
// /// @param pool identifier, usually matching the series (bytes6 tag)
// /// @param base identifier (bytes6 tag)
// /// @param amount of base to initialize pool with
// /// @param amount of fyToken to initialize pool with
// export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
//   [FYUSDT2212, USDT, ONEUSDT.mul(100), ZERO],
//   // [FYUSDT2303, USDT, WAD.mul(100), ZERO],
// ]
//
// /// @notice Ilks to accept for series
// /// @param series identifier (bytes6 tag)
// /// @param newly accepted ilks (array of bytes6 tags)
// export const seriesIlks: Array<[string, string[]]> = [
//   [FYUSDT2212, [USDT, ETH, DAI, USDC, FRAX, WBTC, WSTETH, LINK, ENS, UNI]],
//   // [FYUSDT2303, [USDT, ETH, DAI, USDC, FRAX, WBTC, WSTETH, LINK, ENS, UNI]],
// ]
//
// /// @notice Deploy strategies
// /// @param strategy name
// /// @param strategy identifier (bytes6 tag)
// /// @param Address for the related Join
// /// @param Address for the related asset
// export const strategiesData: Array<[string, string, string, string, string]> = [
//   // name, symbol, baseId
//   ['Yield Strategy USDT 6M Jun Dec', YSUSDT6MJD, USDT, newJoins.get(USDT) as string, assets.get(USDT) as string],
//   // ['Yield Strategy USDT 6M Sep Mar', YSUSDT6MMS, USDT, newJoins.get(USDT) as string, assets.get(USDT) as string],
// ]
//
// /// @notice Strategy initialization parameters
// /// @param strategy identifier (bytes6 tag)
// /// @param address of initial pool
// /// @param series identifier (bytes6 tag)
// /// @param amount of base to initialize strategy with
// /// @param fix this is true unless it is a nonTv pool
// export const strategiesInit: Array<[string, string, string, BigNumber, boolean]> = [
//   // [strategyId, startPoolAddress, startPoolId, initAmount]
//   [YSUSDT6MJD, newPools.get(FYUSDT2212) as string, FYUSDT2212, ONEUSDT.mul(100), true],
//   // [YSUSDT6MMS, newPools.get(FYUSDT2303) as string, FYUSDT2303, WAD.mul(100)],
// ]
