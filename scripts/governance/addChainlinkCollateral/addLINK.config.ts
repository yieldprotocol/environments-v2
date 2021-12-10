/**
 * @dev Input file for adding LINK as a collateral
 */

import { ETH, DAI, USDC, LINK } from '../../../shared/constants'
import { FYDAI2112, FYDAI2203, FYUSDC2112, FYUSDC2203 } from '../../../shared/constants'
import { CHAINLINK } from '../../../shared/constants'

export const developer: Map<number, string> = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

export const assets: Map<number, Map<string, string>> = new Map([
[1, new Map([
  [ETH,    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
  [DAI,    '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
  [USDC,   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  [LINK,   '0x514910771af9ca656af840dff83e8264ecf986ca'],
])],
[4, new Map([
  [ETH,    '0xB370AFD9Efb99BD5CD0aD934AECfF00f949BC69c'],
  [DAI,    '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
  [USDC,   '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
  [LINK,   '0xfdf099372cded51a9dA9c0431707789f08B06C70'],
])],
[42, new Map([
  [ETH,    '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
  [DAI,    '0xaFCdc724EB8781Ee721863db1B15939675996484'],
  [USDC,   '0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D'],
  [LINK,   '0xB62FCB2ef1d1819aED135F567859b080ddFe1008'],
])],
])

export const chainlinkSources: Map<number, Array<[string, string, string, string, string]>> = new Map([
  [1, [
    [LINK,   (assets.get(1) as Map<string, string>).get(LINK)   as string, ETH, (assets.get(1) as Map<string, string>).get(ETH) as string, '0xDC530D9457755926550b59e8ECcdaE7624181557'],
  ]],
  [4, [
    [LINK,   (assets.get(4) as Map<string, string>).get(LINK)   as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0xFABe80711F3ea886C3AC102c81ffC9825E16162E'],
  ]],
  [42, [
    [LINK,   (assets.get(42) as Map<string, string>).get(LINK)   as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38'],
  ]],
])

export const whale: Map<number, string> = new Map([
  [1, '0x0d4f1ff895d12c34994d6b65fabbeefdc1a9fb39'],
  [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

// Assets for which we will have a Join
export const assetToAdd: Map<number, [string, string]> = new Map([
  [1,  [LINK, (assets.get(1) as Map<string, string>).get(LINK) as string]],
  [4,  [LINK, (assets.get(4) as Map<string, string>).get(LINK) as string]],
  [42, [LINK, (assets.get(42) as Map<string, string>).get(LINK) as string]],
])

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const limits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI,  LINK, CHAINLINK, 1670000, 600000, 1000000, 5000, 18],
  [USDC, LINK, CHAINLINK, 1670000, 600000, 1000000, 5000, 6],
]

// Input data: seriesId, [ilkId]
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2112,  [LINK]],
  [FYDAI2203,  [LINK]],
  [FYUSDC2112, [LINK]],
  [FYUSDC2203, [LINK]],
]
