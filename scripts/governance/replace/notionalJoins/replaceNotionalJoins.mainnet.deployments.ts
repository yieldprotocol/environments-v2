import { ETH, FCASH, FETH2212, FETH2303, FCASH_DEC22, FCASH_MAR23, FCASH_ETH } from '../../../../shared/constants'
import { ContractDeployment } from '../../confTypes' // Note we use the series id as the asset id
import * as base_config from '../../base.mainnet.config'

export const developer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'
export const deployer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'

export const governance: Map<string, string> = base_config.governance
const external: Map<string, string> = base_config.external
const assets: Map<string, string> = base_config.assets
const joins: Map<string, string> = base_config.joins

export const contractDeployments: ContractDeployment[] = [
  /// @param fCashAddress Address for the notional contract
  /// @param underlyingAddress Address for the underlying asset
  /// @param underlyingJoinAddress Address for the join of the underlying asset
  /// @param maturity Maturity of the Notional series, in unix time
  /// @param currencyId Notional currency id
  {
    addressFile: 'joins.json',
    name: FETH2212,
    contract: 'NotionalJoin',
    args: [
      () => external.getOrThrow(FCASH),
      () => assets.getOrThrow(ETH),
      () => joins.getOrThrow(ETH),
      () => FCASH_DEC22,
      () => FCASH_ETH,
    ],
  },
  {
    addressFile: 'joins.json',
    name: FETH2303,
    contract: 'NotionalJoin',
    args: [
      () => external.getOrThrow(FCASH),
      () => assets.getOrThrow(ETH),
      () => joins.getOrThrow(ETH),
      () => FCASH_MAR23,
      () => FCASH_ETH,
    ],
  },
]
