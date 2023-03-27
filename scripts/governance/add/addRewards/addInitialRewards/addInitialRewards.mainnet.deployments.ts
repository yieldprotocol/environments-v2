import { BigNumber } from 'ethers'
import { ONE64, secondsInOneYear } from '../../../../../shared/constants'
import { YSETH6MJD, RWETH6MJD } from '../../../../../shared/constants'
import { SAFE_ERC20_NAMER, YIELDMATH, ACCUMULATOR } from '../../../../../shared/constants'

import { ContractDeployment } from '../../../confTypes' // Note we use the series id as the asset id

import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const external: Map<string, string> = base_config.external
export const assets: Map<string, string> = base_config.assets
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const joins = () => readAddressMappingIfExists('joins.json')
export const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
export const pools = () => readAddressMappingIfExists('pools.json')
export const strategies = () => readAddressMappingIfExists('strsategies.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  /// @notice Deploy rewards wrapper
  /// @param name
  /// @param symbol
  /// @param decimals
  {
    addressFile: 'strategies.json',
    name: RWETH6MJD,
    contract: 'ERC20RewardsWrapper',
    args: [() => 'RWETH6MJD', () => 'RWETH6MJD', () => 18],
  },
]
