import { Type } from 'class-transformer'
import 'reflect-metadata'

export class ProtocolObjectProxy {
  @Type(() => NetworksEntityProxy)
  public networks: NetworksEntityProxy[] = [] as NetworksEntityProxy[]
}

export class NetworksEntityProxy {
  public name: string = ''
  public protocol: ProtocolProxy = {} as ProtocolProxy
  public config: ConfigProxy = {} as ConfigProxy
}

export class ProtocolProxy {
  @Type(() => ProtocolEntity)
  public cauldron: ProtocolEntity[] = [] as ProtocolEntity[]

  @Type(() => ProtocolEntity)
  public ladle: ProtocolEntity[] = [] as ProtocolEntity[]

  @Type(() => ProtocolEntity)
  public router: ProtocolEntity[] = [] as ProtocolEntity[]

  @Type(() => ProtocolEntity)
  public witch: ProtocolEntity[] = [] as ProtocolEntity[]
}

export class ProtocolEntity {
  public address: string = ''
  public git: string = ''
}

export class ConfigProxy {
  public cauldron: CauldronProxy = {} as CauldronProxy
  public ladle: LadleProxy = {} as LadleProxy
  public witch: WitchProxy = {} as WitchProxy
}

export class CauldronProxy {
  @Type(() => AssetEntityProxy)
  public asset: AssetEntityProxy[] = [] as AssetEntityProxy[]

  @Type(() => SeriesEntityProxy)
  public series: SeriesEntityProxy[] = [] as SeriesEntityProxy[]

  @Type(() => IlksEntityProxy)
  public ilks: IlksEntityProxy[] = [] as IlksEntityProxy[]

  @Type(() => LendingOracleEntityProxy)
  public lendingOracle: LendingOracleEntityProxy[] = [] as LendingOracleEntityProxy[]

  @Type(() => SpotOraclesEntityProxy)
  public spotOracles: SpotOraclesEntityProxy[] = [] as SpotOraclesEntityProxy[]
}

export class AssetEntityProxy {
  public assetId: string = ''
  public address: string = ''
  public deploymentTime: string = ''
}

export class SeriesEntityProxy {
  public seriesId: string = ''
  public fyToken: string = ''
  public baseId: string = ''
  public maturity: number = 0
}

export class IlksEntityProxy {
  public seriesId: string = ''
  public ilkId: string = ''
}

export class LendingOracleEntityProxy {
  public id: string = ''
  public address: string = ''
}

export class SpotOraclesEntityProxy {
  public asset1: string = ''
  public asset2: string = ''
  public oracleAddress: string = ''
  public ratio: string = ''
}

export class LadleProxy {
  @Type(() => JoinsEntityOrPoolsEntityProxy)
  public joins: JoinsEntityOrPoolsEntityProxy[] = [] as JoinsEntityOrPoolsEntityProxy[]
  @Type(() => JoinsEntityOrPoolsEntityProxy)
  public pools: JoinsEntityOrPoolsEntityProxy[] = [] as JoinsEntityOrPoolsEntityProxy[]
  @Type(() => ModulesEntityOrIntegrationsEntityOrTokensEntityProxy)
  public modules: ModulesEntityOrIntegrationsEntityOrTokensEntityProxy[] = [] as ModulesEntityOrIntegrationsEntityOrTokensEntityProxy[]
  @Type(() => ModulesEntityOrIntegrationsEntityOrTokensEntityProxy)
  public integrations: ModulesEntityOrIntegrationsEntityOrTokensEntityProxy[] = [] as ModulesEntityOrIntegrationsEntityOrTokensEntityProxy[]
  @Type(() => ModulesEntityOrIntegrationsEntityOrTokensEntityProxy)
  public tokens: ModulesEntityOrIntegrationsEntityOrTokensEntityProxy[] = [] as ModulesEntityOrIntegrationsEntityOrTokensEntityProxy[]
}

export class JoinsEntityOrPoolsEntityProxy {
  public assetId: string = ''
  public address: string = ''
}

export class ModulesEntityOrIntegrationsEntityOrTokensEntityProxy {
  public status: boolean = false
  public address: string = ''
}

export class WitchProxy {
  @Type(() => LimitsEntityProxy)
  public limits: LimitsEntityProxy[] = [] as LimitsEntityProxy[]
}

export class LimitsEntityProxy {
  public line: number = 0
  public dust: number = 0
  public dec: number = 0
  public sum: number = 0
}
