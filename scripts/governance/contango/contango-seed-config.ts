import {
  DAI,
  EODEC22,
  EOJUN23,
  EOMAR23,
  EOSEP22,
  EOSEP23,
  ETH,
  getSeriesId,
  USDC,
  USDT,
} from '../../../shared/constants'

export class Asset {
  constructor(
    public bytes: string,
    public symbol: string,
    public stable: boolean,
    public maxDebt: number,
    public minDebt: number,
    public decimals: number,
    public cr: number,
    public collateral: boolean = true
  ) {}
}

export interface Expiry {
  timestamp: number
  display: string
}

export class Series {
  public bytes: string

  constructor(public asset: Asset, public timestamp: number) {
    this.bytes = getSeriesId(asset.bytes, timestamp)
  }
}

export const ASSETS_ARBITRUM: Asset[] = [
  new Asset(ETH, 'ETH', false, 1_000e6, 0.025e6, 12, 1.21e6),
  new Asset(DAI, 'DAI', true, 1_000_000, 40, 18, 1.25e6),
  new Asset(USDC, 'USDC', true, 1_000_000, 40, 6, 1.176e6),
  new Asset(USDT, 'USDT', true, 1_000_000, 40, 6, 1.176e6, false),
]

export const ASSETS_ARBITRUM_MAP: Map<string, Asset> = new Map(ASSETS_ARBITRUM.map((asset) => [asset.bytes, asset]))

export const EXPIRIES: number[] = [EOSEP22, EODEC22, EOMAR23, EOJUN23, EOSEP23]

export const JUNE_SERIES_ARBITRUM: Array<Series> = ASSETS_ARBITRUM.map((asset) => new Series(asset, EOJUN23))

export const NEW_SERIES_ARBITRUM: Array<Series> = [
  ...ASSETS_ARBITRUM.map((asset) => new Series(asset, EOSEP23)),
  new Series(ASSETS_ARBITRUM_MAP.getOrThrow(USDT), EOJUN23),
]

export const SERIES_ARBITRUM: Array<Series> = ASSETS_ARBITRUM.map((asset) =>
  EXPIRIES.map((expiry) => new Series(asset, expiry))
).flat()
