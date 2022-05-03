import { BigNumber } from 'ethers'
import { readAddressMappingIfExists, stringToBytes6 } from '../../../../../../shared/helpers'
import {
  ETH,
  DAI,
  USDC,
  WBTC,
  WSTETH,
  STETH,
  LINK,
  ENS,
  CVX3CRV,
  FYDAI2206,
  FYUSDC2206,
  UNI,
  YVUSDC,
} from '../../../../../../shared/constants'
import { CONVEX3CRV } from '../../../../../../shared/constants'

function bytes6ToBytes32(x: string): string {
  return x + '00'.repeat(26)
}

const protocol = readAddressMappingIfExists('protocol.json')
export const developer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const deployer = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
export const cvxBaseRewardPool = protocol.get('convexPoolMock') as string
export const cvx3CrvAddress = protocol.get('cvx3CrvMock') as string

export const crv = protocol.get('crvMock') as string

export const cvxAddress = protocol.get('cvxMock') as string

export const assets: Map<string, string> = new Map([
  [ETH, '0x67c5279f044A40746017Ae1edD8bb7573273aA8b'],
  [DAI, '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC, '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [WBTC, '0x69A11AA0D394337570d84ce824a1ca6aFA0765DF'],
  [WSTETH, '0xf9F4D9e05503D416E95f05831A95ff43c3A01182'],
  [STETH, '0xE910c4D4802898683De478e57852738e773dBCD9'],
  [LINK, '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
  [ENS, '0x5BeAdC789F094741DEaacd5a1499aEd7E9d7FB78'],
  [UNI, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  [YVUSDC, '0x2381d065e83DDdBaCD9B4955d49D5a858AE5957B'],
  [CVX3CRV, protocol.get('cvx3CrvMock') as string],
])

// CVX3CRV, ETH, 3CRVPool, DAI/ETH chainlink, USDC/ETH chainlink, USDT/ETH chainlink
export const cvx3CrvSources: [string, string, string, string, string, string] = [
  bytes6ToBytes32(CVX3CRV),
  bytes6ToBytes32(ETH),
  protocol.get('curvePoolMock') as string,
  '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D',
  '0xdCA36F27cbC4E38aE16C4E9f99D39b42337F6dcf',
  protocol.get('usdtEthAggregator') as string,
]

export const compositeSources: Array<[string, string, string]> = [
  [CVX3CRV, ETH, protocol.get(CONVEX3CRV) as string],
  // [DAI, ETH, protocol.get(CHAINLINK) as string], // Maybe it's there already?
  // [USDC, ETH, protocol.get(CHAINLINK) as string], // Maybe it's there already?
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, CVX3CRV, [ETH]],
  [USDC, CVX3CRV, [ETH]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [[CVX3CRV, assets.get(CVX3CRV) as string]]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeDebtLimits: Array<[string, string, number, number, number, number]> = [
  [DAI, CVX3CRV, 1000000, 100000, 5000, 18],
  [USDC, CVX3CRV, 1000000, 100000, 5000, 6],
  [ETH, CVX3CRV, 1000000, 200000, 5000, 18],
]

// Input data: ilkId, duration, initialOffer, auctionLine, auctionDust, dec
export const compositeAuctionLimits: Array<[string, number, number, number, number, number]> = [
  [CVX3CRV, 3600, 714000, 500000, 10000, 12],
]

export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2206, [CVX3CRV]],
  [FYUSDC2206, [CVX3CRV]],
]
