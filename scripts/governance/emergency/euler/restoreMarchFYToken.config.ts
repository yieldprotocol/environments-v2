import * as base_config from '../../base.mainnet.config'
import { FYETH2303, FYDAI2303, FYUSDC2303, FYUSDT2303 } from '../../../../shared/constants'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const fyTokens: Map<string, string> = base_config.fyTokens

export const restored = [
  fyTokens.getOrThrow(FYETH2303)!,
  fyTokens.getOrThrow(FYDAI2303)!,
  fyTokens.getOrThrow(FYUSDC2303)!,
  fyTokens.getOrThrow(FYUSDT2303)!,
]
