import { ETH, CVX3CRV } from '../../../../../../shared/constants'
import { CONVEX3CRV as CVX3CRVORACLE } from '../../../../../../shared/constants'
import * as base_config from '../../../../base.mainnet.config'
import * as convex_base_config from './addCvx3Crv.config'

function bytes6ToBytes32(x: string): string {
  return x + '00'.repeat(26)
}

const protocol = base_config.protocol
export const deployer = base_config.deployer
export const developer = base_config.developer
export const assets: Map<string, string> = base_config.assets.set(CVX3CRV, '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c')

export const compositePaths = convex_base_config.compositePaths
export const compositeDebtLimits = convex_base_config.compositeDebtLimits
export const compositeAuctionLimits = convex_base_config.compositeAuctionLimits
export const seriesIlks = convex_base_config.seriesIlks
export const crv = '0xd533a949740bb3306d119cc777fa900ba034cd52'

export const cvx3CrvAddress = '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c' // https://cvx3Crv.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU
export const cvxBaseRewardPool = '0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8'
export const cvxAddress = '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'

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
  '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
  '0x773616E4d11A78F511299002da57A0a94577F1f4',
  '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
  '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
]

/// @notice Sources that will be added to the Composite Oracle
/// @param Base asset identifier (bytes6 tag)
/// @param Quote asset identifier (bytes6 tag)
/// @param Address for the source
export const compositeSources: Array<[string, string, string]> = [[CVX3CRV, ETH, protocol.get(CVX3CRVORACLE) as string]]

/// @notice Assets that will be added to the protocol
/// @param Asset identifier (bytes6 tag)
/// @param Address for the asset
export const assetsToAdd: Array<[string, string]> = [[CVX3CRV, '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c']]
