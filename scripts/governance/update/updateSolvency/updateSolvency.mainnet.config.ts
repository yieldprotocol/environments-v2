import { BigNumber } from 'ethers'
import {
  ZERO,
  ZERO_ADDRESS,
  WAD,
  ONEUSDC,
  MAX256,
  ONE64,
  secondsIn25Years,
  secondsInOneYear,
} from '../../../../shared/constants'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  LINK,
  ENS,
  YVUSDC,
  UNI,
  FDAI2203,
  FUSDC2203,
  FDAI2206,
  FUSDC2206,
  FDAI2209,
  FUSDC2209,
  FRAX,
} from '../../../../shared/constants'
import {
  FYDAI2112,
  FYUSDC2112,
  FYETH2203,
  FYDAI2203,
  FYUSDC2203,
  FYETH2206,
  FYDAI2206,
  FYUSDC2206,
  FYFRAX2206,
  FYETH2209,
  FYDAI2209,
  FYUSDC2209,
  FYFRAX2209,
  FYETH2212,
  FYDAI2212,
  FYUSDC2212,
  FYFRAX2212,
} from '../../../../shared/constants'
import { NOTIONAL } from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const newCompositeSources: Array<[string, string, string]> = [
  [FDAI2203, DAI, protocol.get(NOTIONAL) as string],
  [FDAI2206, DAI, protocol.get(NOTIONAL) as string],
  [FDAI2209, DAI, protocol.get(NOTIONAL) as string],
  [FUSDC2203, USDC, protocol.get(NOTIONAL) as string],
  [FUSDC2206, USDC, protocol.get(NOTIONAL) as string],
  [FUSDC2209, USDC, protocol.get(NOTIONAL) as string],
]

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const newCompositePaths: Array<[string, string, Array<string>]> = [
  [FDAI2203, ETH, [DAI]],
  [FDAI2206, ETH, [DAI]],
  [FDAI2209, ETH, [DAI]],
  [FUSDC2203, ETH, [USDC]],
  [FUSDC2206, ETH, [USDC]],
  [FUSDC2209, ETH, [USDC]],
]

/// @notice Joins that will be added to the Solvency contract
/// @param Asset identifier (bytes6 tag)
export const newJoins = [
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  LINK,
  ENS,
  YVUSDC,
  UNI,
  FDAI2203,
  FUSDC2203,
  FDAI2206,
  FUSDC2206,
  FDAI2209,
  FUSDC2209,
  FRAX,
]

/// @notice Series that will be added to the Solvency contract
/// @param Series identifier (bytes6 tag)
export const newSeries = [
  FYDAI2112,
  FYUSDC2112,
  FYDAI2203,
  FYUSDC2203,
  FYETH2206,
  FYDAI2206,
  FYUSDC2206,
  FYFRAX2206,
  FYETH2209,
  FYDAI2209,
  FYUSDC2209,
  FYFRAX2209,
  FYETH2212,
  FYDAI2212,
  FYUSDC2212,
  FYFRAX2212,
]
