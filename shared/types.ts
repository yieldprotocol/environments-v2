export interface ProtocolObject {
  networks?: NetworksEntity[] | null
}
export interface NetworksEntity {
  name: string
  protocol: Protocol
  config: Config
}
export interface Protocol {
  cauldron?: ProtocolEntity[] | null
  ladle?: ProtocolEntity[] | null
  router?: ProtocolEntity[] | null
  witch?: ProtocolEntity[] | null
}
export interface ProtocolEntity {
  address: string
  git: string
}
export interface Config {
  cauldron: Cauldron
  ladle: Ladle
  witch: Witch
}
export interface Cauldron {
  asset?: AssetEntity[] | null
  series?: SeriesEntity[] | null
  ilks?: IlksEntity[] | null
  lendingOracle?: LendingOracleEntity[] | null
  spotOracles?: SpotOraclesEntity[] | null
}
export interface AssetEntity {
  assetId: string
  address: string
  deploymentTime: string
}
export interface SeriesEntity {
  seriesId: string
  fyToken: string
  baseId: string
  maturity: string
}
export interface IlksEntity {
  seriesId: string
  assetId: string
  ilkId: string
}
export interface LendingOracleEntity {
  id: string
  address: string
}
export interface SpotOraclesEntity {
  asset1: string
  asset2: string
  oracleAddress: string
  ratio: string
}
export interface Ladle {
  joins?: JoinsEntity[] | null
  pools?: PoolsEntity[] | null
  modules?: ModulesEntity[] | null
  integrations?: IntegrationsEntity[] | null
  tokens?: TokensEntity[] | null
}
export interface PoolsEntity {
  assetId: string
  address: string
}
export interface JoinsEntity {
  assetId: string
  address: string
}
export interface ModulesEntity {
  status: boolean
  address: string
}
export interface IntegrationsEntity {
  status: boolean
  address: string
}
export interface TokensEntity {
  status: boolean
  address: string
}
export interface Witch {
  limits?: LimitsEntity[] | null
}
export interface LimitsEntity {
  line: number
  dust: number
  dec: number
  sum: number
}
