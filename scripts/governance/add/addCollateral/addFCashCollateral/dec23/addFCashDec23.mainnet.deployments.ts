import { ETH, DAI, USDC } from '../../../../../../shared/constants'
import { FCASH, FETH2312, FDAI2312, FUSDC2312 } from '../../../../../../shared/constants'
import { FCASH_DEC23, FCASH_ETH, FCASH_DAI, FCASH_USDC } from '../../../../../../shared/notional'

import { ContractDeployment } from '../../../../confTypes' // Note we use the series id as the asset id

import { readAddressMappingIfExists } from '../../../../../../shared/helpers'

import * as addresses from '../../../../addresses.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = addresses.deployers

export const governance: Map<string, string> = addresses.governance
export const external: Map<string, string> = addresses.external
export const assets: Map<string, string> = addresses.assets
export const joins: Map<string, string> = addresses.joins
export const protocol = () => readAddressMappingIfExists('protocol.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  /// @dev Assets for which we will deploy a Join
  /// @param notionalId: asset id of an fCash tenor in the Yield Protocol
  /// @param fcash: address of the fCash contract
  /// @param underlying: address of the fCash underlying
  /// @param underlyingJoin: address of the fCash underlying Join
  /// @param fCashMaturity: maturity in Notional Finance
  /// @param fCashCurrency: id of the underlying in Notional Finance
  {
    addressFile: 'joins.json',
    name: FETH2312,
    contract: 'NotionalJoin',
    args: [
      () => external.getOrThrow(FCASH),
      () => assets.getOrThrow(ETH),
      () => joins.getOrThrow(ETH),
      () => FCASH_DEC23,
      () => FCASH_ETH,
    ],
  },
  {
    addressFile: 'joins.json',
    name: FDAI2312,
    contract: 'NotionalJoin',
    args: [
      () => external.getOrThrow(FCASH),
      () => assets.getOrThrow(DAI),
      () => joins.getOrThrow(DAI),
      () => FCASH_DEC23,
      () => FCASH_DAI,
    ],
  },
  {
    addressFile: 'joins.json',
    name: FUSDC2312,
    contract: 'NotionalJoin',
    args: [
      () => external.getOrThrow(FCASH),
      () => assets.getOrThrow(USDC),
      () => joins.getOrThrow(USDC),
      () => FCASH_DEC23,
      () => FCASH_USDC,
    ],
  },
]
