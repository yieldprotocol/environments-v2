import { stringToBytes6 } from '../../../shared/helpers'
import { DAI, EOJUN23, EOMAR23, EOSEP23, ETH, FRAX, getSeriesId, USDC, USDT } from '../../../shared/constants'

export class Asset {
  constructor(
    public bytes: string,
    public symbol: string,
    public stable: boolean,
    public maxDebt: number,
    public minDebt: number,
    public decimals: number,
    public cr: number
  ) {}
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

export const ASSETS_ARBITRUM: Array<Asset> = [
  new Asset(ETH, 'ETH', false, 50000000, 25000, 12, 1.21e6),
  new Asset(DAI, 'DAI', true, 50_000, 40, 18, 1.25e6),
  new Asset(USDC, 'USDC', true, 50_000, 40, 6, 1.176e6),
  new Asset(USDT, 'USDT', true, 50_000, 40, 6, 1.176e6),
]

export const EXPIRIES: Array<Expiry> = [
  { timestamp: EOMAR23, display: '2303' },
  { timestamp: EOJUN23, display: '2306' },
  { timestamp: EOSEP23, display: '2309' },
]

export const EXISITING_SERIES_ARBITRUM: Array<Series> = ASSETS_ARBITRUM.map((asset) => new Series(asset, EXPIRIES[1]))

export const NEW_SERIES_ARBITRUM: Array<Series> = ASSETS_ARBITRUM.map((asset) => new Series(asset, EXPIRIES[2]))

export const SERIES_ARBITRUM: Array<Series> = NEW_SERIES_ARBITRUM.concat(EXISITING_SERIES_ARBITRUM)
