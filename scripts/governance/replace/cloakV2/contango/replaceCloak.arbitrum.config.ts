import { readAddressMappingIfExists } from '../../../../../shared/helpers'

import { CONTANGO_WITCH, CONTANGO_LADLE } from '../../../../../shared/constants'

import * as base_config from '../../../base.arb_mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = readAddressMappingIfExists('contangoJoins.json')
export const fyTokens: Map<string, string> = readAddressMappingIfExists('contangoFYTokens.json')

export const users: Array<string> = [protocol.getOrThrow(CONTANGO_LADLE), protocol.getOrThrow(CONTANGO_WITCH)]
