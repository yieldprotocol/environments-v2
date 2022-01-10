import { BigNumber } from 'ethers'
import { readAddressMappingIfExists, stringToBytes6 } from '../../../../shared/helpers'
import { ETH, DAI, USDC, WBTC, WSTETH, STETH, LINK, ENS, CVX3CRV } from '../../../../shared/constants'
import { CHAINLINK, COMPOSITE, CONVEX3CRV } from '../../../../shared/constants'

function bytes6ToBytes32(x: string): string {
  return x + '00'.repeat(26)
}

const protocol = readAddressMappingIfExists('protocol.json')

export const deployer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const developer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const cvx3CrvAddress = new Map([
  [1, '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c'],
  [42, protocol.get('cvx3CrvMock') as string],
]) // https://cvx3Crv.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU

export const crvAddress = new Map([
  [1, '0xd533a949740bb3306d119cc777fa900ba034cd52'],
  [42, protocol.get('crvMock') as string],
])

export const cvxAddress = new Map([
  [1, '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'],
  [42, protocol.get('cvxMock') as string],
])

export const assets: Map<string, string> = new Map([
  [ETH, '0x67c5279f044A40746017Ae1edD8bb7573273aA8b'],
  [DAI, '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC, '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [WBTC, '0x69A11AA0D394337570d84ce824a1ca6aFA0765DF'],
  [WSTETH, '0xf9F4D9e05503D416E95f05831A95ff43c3A01182'],
  [STETH, '0xE910c4D4802898683De478e57852738e773dBCD9'],
  [LINK, '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
  [ENS, '0x5BeAdC789F094741DEaacd5a1499aEd7E9d7FB78'],
  [CVX3CRV, '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c'],
])

// CVX3CRV, ETH, 3CRVPool, DAI/ETH chainlink, USDC/ETH chainlink, USDT/ETH chainlink
export const cvx3CrvSources: [string, string, string, string, string, string] = [
  bytes6ToBytes32(CVX3CRV),
  bytes6ToBytes32(ETH),
  '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
  '0x773616E4d11A78F511299002da57A0a94577F1f4',
  '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
  '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
]

export const compositeSources: Array<[string, string, string]> = [
  [CVX3CRV, ETH, protocol.get(CONVEX3CRV) as string],
  [DAI, ETH, protocol.get(CHAINLINK) as string], // Maybe it's there already?
  [USDC, ETH, protocol.get(CHAINLINK) as string], // Maybe it's there already?
]

export const compositePaths: Array<[string, string, Array<string>]> = [
  [DAI, CVX3CRV, [ETH]],
  [USDC, CVX3CRV, [ETH]],
]

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [[CVX3CRV, assets.get(CVX3CRV) as string]]

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const compositeLimits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI, CVX3CRV, COMPOSITE, 1000000, 600000, 50, 5, 18],
  [USDC, CVX3CRV, COMPOSITE, 1000000, 600000, 50, 5, 6],
  [ETH, CVX3CRV, CONVEX3CRV, 1000000, 600000, 250, 10, 18],
]

// Input data: seriesId, [ilkIds]
// export const seriesIlks: Array<[string, string[]]> = [
//   [FYDAI2112, [CVX3CRV]],
//   [FYDAI2203, [CVX3CRV]],
//   [FYUSDC2112, [CVX3CRV]],
//   [FYUSDC2203, [CVX3CRV]],
//   [FYETH2203, [CVX3CRV]],
//   [FYETH2206, [CVX3CRV]],
// ]
export const seriesIlks: Array<[string, string[]]> = [
  [stringToBytes6('0104'), [CVX3CRV]],
  [stringToBytes6('0105'), [CVX3CRV]],
  [stringToBytes6('0204'), [CVX3CRV]],
  [stringToBytes6('0205'), [CVX3CRV]],
]
