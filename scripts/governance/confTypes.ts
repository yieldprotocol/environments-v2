import { BigNumber } from 'ethers'

export interface ContractDeployment {
  addressFile: string // The json file to store the address in (e.g 'protocol.json')
  name: string // The unique name to the contract (e.g 'witch')
  contract: string // The contract name to deploy (e.g '@yield-protocol/vault-v2/contracts/Witch.sol/Witch')
  args: (() => any)[] // The parameters to the constructor (e.g [cauldron.address, ladle.address])
  libs?: { [libraryName: string]: string } // The external libraries to the contract (e.g { YieldMath: yieldMath.address })
}

export interface Asset {
  assetId: string
  address: string
}

export interface AuctionLineAndLimit {
  baseId: string
  ilkId: string
  duration: number
  vaultProportion: BigNumber
  collateralProportion: BigNumber
  max: BigNumber
}

export interface DebtLimit {
  baseId: string
  ilkId: string
  line: number
  dust: number
  dec: number
}

export interface Collateralization {
  baseId: string
  ilkId: string
  oracle: string
  ratio: number
}

export interface OracleSource {
  baseId: string
  baseAddress: string
  quoteId: string
  quoteAddress: string
  sourceAddress: string
}

export interface OraclePath {
  baseId: string
  quoteId: string
  path: string[]
}

export interface Accumulator {
  baseId: string
  kind: string
  startRate: BigNumber
  perSecondRate: BigNumber
}

export interface Base {
  asset: Asset
  rateOracle: string
}

export interface Ilk {
  baseId: string
  ilkId: string
  asset: Asset
  collateralization: Collateralization
  debtLimits: DebtLimit
  auctionLineAndLimit: AuctionLineAndLimit
}

export interface Series {
  seriesId: string
  base: Asset
  fyToken: Asset
  chiOracle: string
  ilks: Ilk[]
}
