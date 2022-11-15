import { BigNumberish } from 'ethers'
import { GIVER, YIELD_NOTIONAL_LEVER } from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import { YieldNotionalLever } from '../../../../typechain'

import * as base_config from '../../base.arb_mainnet.config'

import { ContractDeployment } from '../../confTypes'

export const chainId: number = base_config.chainId
export const developer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const deployer: string = '0xfe90d993367bc93D171A5ED88ab460759DE2bED6'
export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: YIELD_NOTIONAL_LEVER,
    contract: 'YieldNotionalLever',
    args: [() => protocol().getOrThrow(GIVER)],
  },
]

/// @notice Flashfeefactor to be set on asset's join
/// @param assetId
/// @param flashFeeAmount
export const joinFlashFees: [string, string][] = [
  ['0x303000000000', '0'],
  ['0x303100000000', '0'],
  ['0x303200000000', '0'],
]

/// @notice Flashfeefactor to be set on fyTokens
/// @param seriesId
/// @param flashFee
export const fyTokenFlashFees: [string, string][] = [
  ['0x303130380000', '0'],
  ['0x303230380000', '0'],
]

export const ilkInfo: [string, YieldNotionalLever.IlkInfoStruct][] = [
  ['0x323400000000', { join: '0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4', maturity: 1671840000, currencyId: 3 }],
  ['0x323300000000', { join: '0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc', maturity: 1671840000, currencyId: 2 }],
]
