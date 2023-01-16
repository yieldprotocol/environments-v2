import { stringToBytes6 } from './helpers'
import { EOJUN23, getSeriesId } from './constants'

export class Asset {
  public bytes: string

  constructor(
    public code: string,
    public symbol: string,
    public stable: boolean,
    public maxDebt: number,
    public minDebt: number,
    public decimals: number
  ) {
    this.bytes = stringToBytes6(code)
  }
}

export interface Expiry {
  timestamp: number
  display: string
}

export class Series {
  public bytes: string

  constructor(public asset: Asset, public expiry: Expiry) {
    this.bytes = getSeriesId(asset.bytes, expiry.timestamp)
  }
}

export const ASSETS_MAINNET: Array<Asset> = [
  new Asset('00', 'ETH', false, 100, 1, 18),
  new Asset('01', 'DAI', true, 100_000, 1000, 18),
  new Asset('02', 'USDC', true, 100_000, 1000, 6),
  new Asset('18', 'FRAX', true, 100_000, 1000, 18),
]

export const ASSETS_ARBITRUM: Array<Asset> = [
  new Asset('00', 'ETH', false, 50000000, 25000, 12),
  new Asset('01', 'DAI', true, 50_000, 40, 18),
  new Asset('02', 'USDC', true, 50_000, 40, 6),
]

export const EXPIRIES: Array<Expiry> = [{ timestamp: EOJUN23, display: '2306' }]

export const SERIES_ARBITRUM: Array<Series> = ASSETS_ARBITRUM.map((asset) =>
  EXPIRIES.map((expiry) => new Series(asset, expiry))
).flat()
export const SERIES_MAINNET: Array<Series> = ASSETS_MAINNET.map((asset) =>
  EXPIRIES.map((expiry) => new Series(asset, expiry))
).flat()
