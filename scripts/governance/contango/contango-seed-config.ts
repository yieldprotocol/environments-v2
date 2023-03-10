import { stringToBytes6 } from '../../../shared/helpers'
import { EOJUN23, EOMAR23, getSeriesId } from '../../../shared/constants'

export class Asset {
  public bytes: string

  constructor(
    public code: string,
    public symbol: string,
    public stable: boolean,
    public maxDebt: number,
    public minDebt: number,
    public decimals: number,
    public cr: number
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
    // Only caters for march as it's the only expiry we're using with the old convention
    this.bytes =
      expiry.timestamp < 1688137200 ? stringToBytes6(`${asset.code}09`) : getSeriesId(asset.bytes, expiry.timestamp)
  }
}

export const ASSETS_MAINNET: Array<Asset> = [
  new Asset('00', 'ETH', false, 100, 1, 18, 1.21e6),
  new Asset('01', 'DAI', true, 100_000, 1000, 18, 1.3e6),
  new Asset('02', 'USDC', true, 100_000, 1000, 6, 1.316e6),
  new Asset('18', 'FRAX', true, 100_000, 1000, 18, 1.316e6),
]

export const ASSETS_ARBITRUM: Array<Asset> = [
  new Asset('00', 'ETH', false, 50000000, 25000, 12, 1.21e6),
  new Asset('01', 'DAI', true, 50_000, 40, 18, 1.25e6),
  new Asset('02', 'USDC', true, 50_000, 40, 6, 1.176e6),
]

export const EXPIRIES: Array<Expiry> = [
  { timestamp: EOMAR23, display: '2303' },
  { timestamp: EOJUN23, display: '2306' },
]

export const SERIES_ARBITRUM: Array<Series> = ASSETS_ARBITRUM.map((asset) =>
  EXPIRIES.map((expiry) => new Series(asset, expiry))
).flat()
export const SERIES_MAINNET: Array<Series> = ASSETS_MAINNET.map((asset) =>
  EXPIRIES.map((expiry) => new Series(asset, expiry))
).flat()
