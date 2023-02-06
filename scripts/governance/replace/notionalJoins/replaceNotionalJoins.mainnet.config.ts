import { readAddressMappingIfExists } from '../../../../shared/helpers'

import * as base_config from '../../base.mainnet.config'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const external: Map<string, string> = base_config.external
export const governance: Map<string, string> = base_config.governance
export const protocol = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const oldJoins: Map<string, string> = readAddressMappingIfExists('oldJoins.json')

import { FCASH, FETH2212, FETH2303 } from '../../../../shared/constants'

export const newJoins = new Map<string, string>([
  [FETH2212, joins.getOrThrow(FETH2212)],
  [FETH2303, joins.getOrThrow(FETH2303)],
])

export const newAssets = [
  [FETH2212, external.getOrThrow(FCASH), joins.getOrThrow(FETH2212)],
  [FETH2303, external.getOrThrow(FCASH), joins.getOrThrow(FETH2303)],
]

export const joinReplacements = [
  [oldJoins.getOrThrow(FETH2212), joins.getOrThrow(FETH2212)],
  [oldJoins.getOrThrow(FETH2303), joins.getOrThrow(FETH2303)],
]
