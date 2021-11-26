/**
 * @dev Input file for addUNI-1.ts, addUNI-2.ts & addUNI.test.ts
 */

import { USDC, UNI, DAI, ETH } from '../../../../shared/constants'
import { stringToBytes6 } from '../../../../shared/helpers'

// Input data: baseId, ilkId, maxDebt
export const assetAddress = new Map([
  [1, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  [42, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
]) // https://github.com/Uniswap/v3-periphery/blob/main/deploys.md

export const assetOracleAddress = new Map([[1, '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e'],[42,'0xD95f3FeeB66108413819D1528D0365594Bc43f31']]) // https://docs.chain.link/docs/ethereum-addresses/

export const wethAddress = new Map([
  [1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
  [42, '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
]) // From assets.json in addresses archive

export const uniWhale = new Map([
  [1, '0x47173b170c64d16393a52e6c480b3ad8c302ba1e'],
  [42, '0x41653c7d61609d856f29355e404f310ec4142cfb'],
]) // From assets.json in addresses archive

export const developerIfImpersonating = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

const CHAINLINK = 'chainlinkOracle'
// Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
export const ilks: Array<[string, string, string, number, number, number, number, number]> = [
  [DAI, UNI, CHAINLINK, 2000000, 500000, 250000, 100, 18],
  [USDC, UNI, CHAINLINK, 2000000, 500000, 250000, 100, 6],
]

// Input data: seriesId, [ilkId]
export const seriesIlks: Array<[string, string[]]> = [
  [stringToBytes6('0104'), [UNI]],
  [stringToBytes6('0105'), [UNI]],
  [stringToBytes6('0204'), [UNI]],
  [stringToBytes6('0205'), [UNI]],
]

// Input data: baseId, base address, quoteId, quote address, oracle name, source address
export function assetEthSource(chainId: any) {
  const assetEthSource: Array<[string, string, string, string, string]> = [
    [
      UNI,
      assetAddress.get(chainId) as string,
      ETH,
      wethAddress.get(chainId) as string,
      assetOracleAddress.get(chainId) as string,
    ],
  ]
  return assetEthSource
}

// Input data: assetId, asset address
export function addAssets(chainId: any) {
  const addedAssets: Array<[string, string]> = [[UNI, assetAddress.get(chainId) as string]]

  return addedAssets
}
