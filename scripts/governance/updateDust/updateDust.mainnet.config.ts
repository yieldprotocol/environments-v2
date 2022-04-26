/**
 * @dev Input file for updateDust.ts
 */

import { readAddressMappingIfExists } from '../../../shared/helpers'
import { FRAX } from '../../../shared/constants'

import * as base_config from '../base.mainnet.config'
export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol

// Input data: baseId, ilkId, line, dust, dec
export const newMin: Array<[string, string, number]> = [[FRAX, FRAX, 0]]
