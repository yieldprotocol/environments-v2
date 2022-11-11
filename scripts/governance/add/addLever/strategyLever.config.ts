import { CAULDRON, GIVER, YIELD_STRATEGY_LEVER } from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'

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
    name: GIVER,
    contract: 'Giver',
    args: [() => protocol().getOrThrow(CAULDRON)],
  },
  {
    addressFile: 'protocol.json',
    name: YIELD_STRATEGY_LEVER,
    contract: 'YieldStrategyLever',
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
  ['0x303030380000', '0'],
  ['0x303130380000', '0'],
  ['0x303230380000', '0'],
]