import { BigNumber } from 'ethers'

/// @dev An entity is anything that has an address on the blockchain. EOAs and contracts.
export interface Entity {
  roles: Role[]
  address: string
}

/// @dev A permission is a function signature on a given entity (obviously not EOAs)
export interface Permission {
  contract: Entity
  signature: string
}

/// @dev A role is a group of permissions. Developer, Governor, Ladle.
export interface Role {
  key: string
  permissions: Permission[]
}

/// @dev A singleton is an entity that can be referenced on its own.
export interface Singleton extends Entity {
  key: string
}

/// @dev An asset is an ERC20 contract that is known to the Yield Protocol.
export interface Asset extends Entity {
  assetId: string
  name: string
  symbol: string
  decimals: number
}

/// @dev A base is an asset that can be borrowed. It has oracles for borrowing and lending rates,
/// and a list of other assets that can be used as collateral for borrowing, with certain conditions for each.
export interface Base extends Asset {
  rateOracle: Oracle
  chiOracle: Oracle
  ilks: Ilk[]
}

/// @dev An fyToken is an asset that after maturity can be exchanged for a base asset
export interface FYToken extends Asset {
  maturity: number
  underlying: Base
}

/// @dev A pool is a YieldSpace AMM between an fyToken and it's base
export interface Pool extends Asset {
  base: Base
  fyToken: FYToken
  ts: BigNumber
  g1: number
}

/// @dev An Euler pool is a pool that keeps its base assets invested in an eToken
export interface EulerPool extends Pool {
  shares: Asset
}

/// @dev A strategy allows LPs to keep a given asset type invested in matching pools, rolling to a new pool after maturity.
export interface Strategy extends Asset {
  base: Base
  pool: Pool
}

/// @dev A Join stores an asset for the Yield Protocol
export interface Join extends Entity {
  asset: Asset
}

/// @dev An oracle source provides a price feed for a given pair of assets
export interface OracleSource extends Entity {
  baseId: Asset
  quoteId: Asset
}

/// @dev An oracle returns the value of an asset amount in terms of another asset.
/// An oracle can potentially perform such calculations for more than a pair of assets.
export interface Oracle extends Entity {
  sources: OracleSource[]
}

/// @dev An ilk is a configuration set that defines how a given asset is used as collateral to borrow a given base.
export interface Ilk {
  baseId: string
  ilkId: string
  line: number
  dust: number
  decimals: number
  spotOracle: string
  ratio: number
}

/// @dev An auction is a configuration set that defines how a vault from a given ilk will be auctioned if insolvent
export interface Auction {
  ilk: Ilk
  duration: number
  vaultProportion: BigNumber
  collateralProportion: BigNumber
  max: BigNumber
}

/// @dev A single-object representation fo the Yield Protocol
export interface YieldProtocol {
  cauldron: Singleton
  ladle: Singleton
  witch: Singleton
  assets: Map<string, Asset>
  bases: Map<string, Base>
  ilks: Map<string, Map<string, Ilk>>
  auctions: Map<string, Map<string, Auction>>
  joins: Map<string, Join>
  fyTokens: Map<string, FYToken>
  pools: Map<string, Pool>
  strategies: Map<string, Strategy>
  roles: Map<string, Role>
  accounts: Map<string, Entity>
}
