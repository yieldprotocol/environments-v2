import {
  ETH,
  DAI,
  USDC,
  FDAI2212,
  FDAI2303,
  FDAI2306,
  FDAI2309,
  FDAI2312,
  FUSDC2212,
  FUSDC2303,
  FUSDC2306,
  FUSDC2309,
  FUSDC2312,
  FETH2212,
  FETH2303,
  FETH2306,
  FETH2309,
  FETH2312,
} from '../../../../shared/constants'

import { NOTIONAL, COMPOSITE } from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const newCompositeSources: Array<[string, string, string]> = [
  [FDAI2212, DAI, protocol.get(NOTIONAL) as string],
  [FDAI2303, DAI, protocol.get(NOTIONAL) as string],
  [FDAI2306, DAI, protocol.get(NOTIONAL) as string],
  [FDAI2309, DAI, protocol.get(NOTIONAL) as string],
  [FDAI2312, DAI, protocol.get(NOTIONAL) as string],
  [FUSDC2212, USDC, protocol.get(NOTIONAL) as string],
  [FUSDC2303, USDC, protocol.get(NOTIONAL) as string],
  [FUSDC2306, USDC, protocol.get(NOTIONAL) as string],
  [FUSDC2309, USDC, protocol.get(NOTIONAL) as string],
  [FUSDC2312, USDC, protocol.get(NOTIONAL) as string],
  [FETH2212, ETH, protocol.get(NOTIONAL) as string],
  [FETH2303, ETH, protocol.get(NOTIONAL) as string],
  [FETH2306, ETH, protocol.get(NOTIONAL) as string],
  [FETH2309, ETH, protocol.get(NOTIONAL) as string],
  [FETH2312, ETH, protocol.get(NOTIONAL) as string],
]

/// @notice Paths that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Path to traverse (array of bytes6 tags)
export const newCompositePaths: Array<[string, string, Array<string>]> = [
  [FDAI2212, ETH, [DAI]],
  [FDAI2303, ETH, [DAI]],
  [FDAI2306, ETH, [DAI]],
  [FDAI2309, ETH, [DAI]],
  [FDAI2312, ETH, [DAI]],
  [FUSDC2212, ETH, [USDC]],
  [FUSDC2303, ETH, [USDC]],
  [FUSDC2306, ETH, [USDC]],
  [FUSDC2309, ETH, [USDC]],
  [FUSDC2312, ETH, [USDC]],
]

export const newSpotOracles: Array<[string, string, string, number]> = [
  [FDAI2212, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FDAI2303, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FDAI2306, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FDAI2309, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FDAI2312, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FUSDC2212, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FUSDC2303, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FUSDC2306, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FUSDC2309, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FUSDC2312, ETH, protocol.get(COMPOSITE) as string, 2000000],
  [FETH2212, ETH, protocol.get(NOTIONAL) as string, 2000000],
  [FETH2303, ETH, protocol.get(NOTIONAL) as string, 2000000],
  [FETH2306, ETH, protocol.get(NOTIONAL) as string, 2000000],
  [FETH2309, ETH, protocol.get(NOTIONAL) as string, 2000000],
  [FETH2312, ETH, protocol.get(NOTIONAL) as string, 2000000],
]
