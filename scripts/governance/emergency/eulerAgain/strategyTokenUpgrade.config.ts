
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
    merkleRoot: '0xadf98f1f116bd6d1ef767d39b87f12b2ba4bd19ac5c8fe6735bdf454742fd583',
  },
  {
    tokenIn: YSDAI6MJD_EH,
    tokenOut: YSDAI6MJD,
    merkleRoot: '0xaff482953e64490bfdb8acd391c5371e48b55d707d3a7e75aa0665888f0313b1',
  },
  {
    tokenIn: YSUSDC6MJD_EH,
    tokenOut: YSUSDC6MJD,
    merkleRoot: '0x99fe5bdc377ce98b7176bfa55cd979c6c959a303bf614d756ba5ac34410f4e3f',
  },
  {
    tokenIn: YSETH6MMS_EH,
    tokenOut: YSETH6MMS,
    merkleRoot: '0x35059d74c81a0b5e4a5eeb48428611efb1595c2e3cc48304efbe9f62ab80f369',
  },
  {
    tokenIn: YSDAI6MMS_EH,
    tokenOut: YSDAI6MMS,
    merkleRoot: '0x0bb4892bd80fc7308e92f088a6c3fa38ed97577ac1326b8d64367d8e5cf39245',
  },
  {
    tokenIn: YSUSDC6MMS_EH,
    tokenOut: YSUSDC6MMS,
    merkleRoot: '0x59d791bfc87acd0f45f7c0279f9532b65405b21eebfed0f08cc003d6ee267cff',
  },
]