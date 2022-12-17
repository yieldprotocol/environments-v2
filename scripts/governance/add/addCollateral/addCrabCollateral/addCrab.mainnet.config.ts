import {
  CRAB,
  CRAB_ORACLE,
  DAI,
  ETH,
  FYDAI2212,
  FYDAI2303,
  FYETH2212,
  FYETH2303,
  FYUSDC2212,
  FYUSDC2303,
  OSQTH,
  UNISWAP,
  USDC,
} from '../../../../../shared/constants'
import { AuctionLineAndLimit, ContractDeployment } from '../../../confTypes'
import * as base_config from '../../../base.mainnet.config'
import { parseUnits } from 'ethers/lib/utils'

export const assets: Map<string, string> = base_config.assets
export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const governance: Map<string, string> = base_config.governance
export const protocol = base_config.protocol
export const newJoins: Map<string, string> = base_config.newJoins
export const deployers: Map<string, string> = base_config.deployers
export const whales: Map<string, string> = base_config.whales

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: 'crabOracle',
    contract: 'CrabOracle',
    args: [() => CRAB, () => OSQTH, () => ETH, () => assets.getOrThrow(CRAB)!, () => protocol().getOrThrow(UNISWAP)!],
  },
  {
    addressFile: 'newJoins.json',
    name: CRAB,
    contract: 'Join',
    args: [() => assets.getOrThrow(CRAB)!],
  },
]

export const uniswapOracleSources: [string, string, string, number][] = [
  [ETH, OSQTH, '0x82c427AdFDf2d245Ec51D8046b41c4ee87F0d29C', 100],
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: Array<[string, string, string]> = [[CRAB, ETH, protocol().getOrThrow(CRAB_ORACLE)!]]

export const newCompositePaths: Array<[string, string, Array<string>]> = [
  [CRAB, USDC, [ETH]],
  [CRAB, DAI, [ETH]],
]

/// @notice Configure an asset as an ilk for a base using the Chainlink Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Ilk asset identifier (bytes6 tag)
/// @param Collateralization ratio as a fixed point number with 6 decimals
/// @param Debt ceiling, modified by decimals
/// @param Minimum vault debt, modified by decimals
/// @param Decimals to append to debt ceiling and minimum vault debt.
export const newCrabLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, CRAB, 1400000, 250, 1, 18],
  [USDC, CRAB, 1330000, 250000, 1000, 6],
  [DAI, CRAB, 1330000, 250000, 1000, 18],
]

/// @notice Ilks to accept for series
/// @param series identifier (bytes6 tag)
/// @param newly accepted ilks (array of bytes6 tags)
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2212, [CRAB]],
  [FYUSDC2212, [CRAB]],
  [FYDAI2212, [CRAB]],
  [FYETH2303, [CRAB]],
  [FYUSDC2303, [CRAB]],
  [FYDAI2303, [CRAB]],
]

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
    ilkId: CRAB,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.78571429'), // 110 / 140
    max: parseUnits('1000'),
  },
  {
    baseId: USDC,
    ilkId: CRAB,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.82706767'), // 110 / 133
    max: parseUnits('1000'),
  },
  {
    baseId: DAI,
    ilkId: CRAB,
    duration: 600,
    vaultProportion: parseUnits('0.5'),
    collateralProportion: parseUnits('0.82706767'), // 110 / 133
    max: parseUnits('1000'),
  },
]
