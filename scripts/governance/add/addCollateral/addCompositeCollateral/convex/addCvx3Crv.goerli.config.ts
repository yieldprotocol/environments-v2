import { ETH, CVX3CRV } from '../../../../../../shared/constants'
import { CONVEX3CRV } from '../../../../../../shared/constants'
import * as base_config from '../../../../base.goerli.config'
import * as convex_base_config from './addCvx3Crv.config'

function bytes6ToBytes32(x: string): string {
  return x + '00'.repeat(26)
}

const protocol = base_config.protocol
export const deployer = base_config.deployer
export const developer = base_config.developer
export const assets: Map<string, string> = base_config.assets.set(CVX3CRV, protocol.get('cvx3CrvMock') as string)

export const compositePaths = convex_base_config.compositePaths
export const compositeDebtLimits = convex_base_config.compositeDebtLimits
export const seriesIlks = convex_base_config.seriesIlks
export const compositeAuctionLimits = convex_base_config.compositeAuctionLimits

export const crv = protocol.get('crvMock') as string
export const cvx3CrvAddress = protocol.get('cvx3CrvMock') as string
export const cvxBaseRewardPool = protocol.get('convexPoolMock') as string
export const cvxAddress = protocol.get('cvxMock') as string

/// @notice Threecrv pool and the chainlink sources for cvx3crv oracle
/// @param  cvx3CrvId_ cvx3crv Id
/// @param  ethId_ ETH ID
/// @param  threecrv_ The 3CRV pool address
/// @param  DAI_ DAI/ETH chainlink price feed address
/// @param  USDC_ USDC/ETH chainlink price feed address
/// @param  USDT_ USDT/ETH chainlink price feed address
export const cvx3CrvSources: [string, string, string, string, string, string] = [
  bytes6ToBytes32(CVX3CRV),
  bytes6ToBytes32(ETH),
  protocol.get('curvePoolMock') as string,
  '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D',//TODO: Deploy chainlink
  '0xdCA36F27cbC4E38aE16C4E9f99D39b42337F6dcf',//TODO: Deploy chainlink oracle
  protocol.get('usdtEthAggregator') as string,
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: Array<[string, string, string]> = [
  [CVX3CRV, ETH, protocol.get(CONVEX3CRV) as string],
]

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
export const assetsToAdd: Array<[string, string]> = [[CVX3CRV, protocol.get('cvx3CrvMock') as string]]
