import { CONTANGO_WITCH, CONTANGO_LADLE } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const external: Map<string, string> = base_config.external

export const users: Array<string> = [protocol.getOrThrow(CONTANGO_LADLE), protocol.getOrThrow(CONTANGO_WITCH)]
