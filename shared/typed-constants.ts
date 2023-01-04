import { stringToBytes6 } from './helpers'

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
  code: string
  display: string
}

export class Series {
  public bytes: string

  constructor(public asset: Asset, public expiry: Expiry) {
    this.bytes = stringToBytes6(asset.code + expiry.code)
  }
}

export const ASSETS: Array<Asset> = [
  new Asset('00', 'ETH', false, 100, 1, 18),
  new Asset('01', 'DAI', true, 100000, 1000, 18),
  new Asset('02', 'USDC', true, 100000, 1000, 6),
  new Asset('18', 'FRAX', true, 100000, 1000, 18),
]

export const EXPIRIES: Array<Expiry> = [
  { code: '08', display: '2212' },
  { code: '09', display: '2303' },
]

export const SERIES: Array<Series> = ASSETS.map((asset) => EXPIRIES.map((expiry) => new Series(asset, expiry))).flat()
