import { BigNumber } from 'ethers'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSETH6MMS, YSDAI6MMS, YSUSDC6MMS } from '../../../../shared/constants'
import { YSETH6MJD_EH, YSDAI6MJD_EH, YSUSDC6MJD_EH, YSETH6MMS_V1, YSDAI6MMS_V1, YSUSDC6MMS_V1 } from '../../../../shared/constants'

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

import { Transfer } from '../../confTypes'

interface Upgrade {
  tokenIn: string,
  tokenOut: string,
  merkleRoot: string,
  amount: BigNumber
}

export const upgrades: Array<Upgrade> = [
  {
    tokenIn: YSETH6MMS_V1,
    tokenOut: YSETH6MMS,
    merkleRoot: '0x34e9351c5ba7bbdc5458d1f731de1e7a7c0120bb111821c9f531cfaaeed1ed91',
    amount: BigNumber.from('128106015354872300000'),
  },
  {
    tokenIn: YSDAI6MMS_V1,
    tokenOut: YSDAI6MMS,
    merkleRoot: '0xbc32334b822b853bd3aa927b9dfbc283d55b3c12f56f73e19bd9f79fe6b4ec17',
    amount: BigNumber.from('516290007194613000000000'),
  },
  {
    tokenIn: YSUSDC6MMS_V1,
    tokenOut: YSUSDC6MMS,
    merkleRoot: '0xbfb284392d5d7f126e9a7f4b86087e26e973dbd9bee87246634399fde4c7ec31',
    amount: BigNumber.from('926769085322'),
  },
  {
    tokenIn: YSETH6MJD_EH,
    tokenOut: YSETH6MJD,
    merkleRoot: '0xcbda0b2309a4b0268a4c5fc1eccc5d81578ef5b99abbfdf9912ae91022c72910',
    amount: BigNumber.from('173876717527907390911'),
  },
  {
    tokenIn: YSDAI6MJD_EH,
    tokenOut: YSDAI6MJD,
    merkleRoot: '0xf77dde7b4617de8f71124fd83788ffc2d6ca9e73891410ffb7f7d30905bdf3dd',
    amount: BigNumber.from('182026100521581669692081'),
  },
  {
    tokenIn: YSUSDC6MJD_EH,
    tokenOut: YSUSDC6MJD,
    merkleRoot: '0x5d81b6f1953dd3f38ff0fee7ad218c301645cab44ec4652fd9c3acd98236ff52',
    amount: BigNumber.from('647405622307'),
  },
]