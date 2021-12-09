 /**
 * @dev Input file for adding UNI as a collateral
 */

import { ETH, DAI, USDC, UNI } from '../../../shared/constants'
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
    [UNI,    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  ])],
  [4, new Map([
    [ETH,    '0xB370AFD9Efb99BD5CD0aD934AECfF00f949BC69c'],
    [DAI,    '0x32E85Fa11a53ac73067881ef7E56d47a3BCe3e2C'],
    [USDC,   '0xf4aDD9708888e654C042613843f413A8d6aDB8Fe'],
    [UNI,    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  ])],
  [42, new Map([
    [ETH,    '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
    [DAI,    '0xaFCdc724EB8781Ee721863db1B15939675996484'],
    [USDC,   '0xeaCB3AAB4CA68F1e6f38D56bC5FCc499B76B4e2D'],
    [UNI,    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  ])],
])
  

export const chainlinkSources: Map<number, Array<[string, string, string, string, string]>> = new Map([
  [1, [
    [UNI,   (assets.get(1) as Map<string, string>).get(UNI)   as string, ETH, (assets.get(1) as Map<string, string>).get(ETH) as string, '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e'],
  ]],
  [4, [
    [UNI,   (assets.get(4) as Map<string, string>).get(UNI)   as string, ETH, (assets.get(4) as Map<string, string>).get(ETH) as string, '0x5E4FaE1eCCAc5a120e48cC02012aF1aeFF94dACc'],
  ]],
  [42, [
    [UNI,   (assets.get(42) as Map<string, string>).get(UNI)   as string, ETH, (assets.get(42) as Map<string, string>).get(ETH) as string, '0xC0E69E49D98D26D52f7505Af1dF8b3009168f945'],
  ]],
])

export const whale = new Map([
  [1, '0x47173b170c64d16393a52e6c480b3ad8c302ba1e'],
  [4, '0x41653c7d61609d856f29355e404f310ec4142cfb'],
  [42, '0x41653c7d61609d856f29355e404f310ec4142cfb'],
])

// Assets for which we will have a Join
export const assetToAdd: Map<number, [string, string]> = new Map([
  [1,  [UNI, (assets.get(1) as Map<string, string>).get(UNI) as string]],
  [4,  [UNI, (assets.get(4) as Map<string, string>).get(UNI) as string]],
  [42, [UNI, (assets.get(42) as Map<string, string>).get(UNI) as string]],
])

// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const limits: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI, UNI, CHAINLINK, 1670000, 600000, 1000000, 100, 18],
  [USDC, UNI, CHAINLINK, 1670000, 600000, 1000000, 100, 6],
]

// Input data: seriesId, [ilkId]
export const seriesIlks: Array<[string, string[]]> = [
  [FYDAI2112,  [UNI]],
  [FYDAI2203,  [UNI]],
  [FYUSDC2112, [UNI]],
  [FYUSDC2203, [UNI]],
]
