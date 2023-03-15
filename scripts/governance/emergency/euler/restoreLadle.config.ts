import * as base_config from '../../base.mainnet.config'
import { LADLE } from '../../../../shared/constants'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol

export const restored = [protocol.getOrThrow(LADLE)!]
