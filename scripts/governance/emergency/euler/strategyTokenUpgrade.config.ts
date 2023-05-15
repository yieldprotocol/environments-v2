
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSUSDT6MJD, YSETH6MMS, YSDAI6MMS, YSUSDC6MMS, YSUSDT6MMS } from '../../../../shared/constants'
import { YSETH6MJD_EH, YSDAI6MJD_EH, YSUSDC6MJD_EH, YSUSDT6MJD_EH, YSETH6MMS_EH, YSDAI6MMS_EH, YSUSDC6MMS_EH, YSUSDT6MMS_EH } from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategies: Map<string, string> = base_config.strategyAddresses


interface Upgrade {
  tokenIn: string,
  tokenOut: string,
  merkleRoot: string,
}

export const upgrades: Array<Upgrade> = [
  {
    tokenIn: YSETH6MJD_EH,
    tokenOut: YSETH6MJD,
    merkleRoot: '0x00',
  },
  {
    tokenIn: YSDAI6MJD_EH,
    tokenOut: YSDAI6MJD,
    merkleRoot: '0x00',
  },
  {
    tokenIn: YSUSDC6MJD_EH,
    tokenOut: YSUSDC6MJD,
    merkleRoot: '0x00',
  },
  {
    tokenIn: YSETH6MMS_EH,
    tokenOut: YSETH6MMS,
    merkleRoot: '0x00',
  },
  {
    tokenIn: YSDAI6MMS_EH,
    tokenOut: YSDAI6MMS,
    merkleRoot: '0x00',
  },
  {
    tokenIn: YSUSDC6MMS_EH,
    tokenOut: YSUSDC6MMS,
    merkleRoot: '0x00',
  },
]