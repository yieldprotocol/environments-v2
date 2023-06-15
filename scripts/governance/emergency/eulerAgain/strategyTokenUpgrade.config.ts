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
    tokenIn: YSETH6MJD_EH,
    tokenOut: YSETH6MJD,
    merkleRoot: '0x6ce935906bdced382850661959ebcfd130b14eab2c29c37050bea4c90114c9f3',
    amount: BigNumber.from('173876717527907390911'),
  },
  {
    tokenIn: YSDAI6MJD_EH,
    tokenOut: YSDAI6MJD,
    merkleRoot: '0x962aa7adb55b84308711284a70dc4506886ae19dfd69d54fdca02142b35acca6',
    amount: BigNumber.from('182026100521581669692081'),
  },
  {
    tokenIn: YSUSDC6MJD_EH,
    tokenOut: YSUSDC6MJD,
    merkleRoot: '0x343455cdbc57a3c999c7ce527e9ababdef7adcfab03b6825409f559476557adc',
    amount: BigNumber.from('647405622307'),
  },
  {
    tokenIn: YSETH6MMS_V1,
    tokenOut: YSETH6MMS,
    merkleRoot: '0xbfc1751b6fe5d3bd9ce8d1c415c537923807288cee388536d19bca8ee04e8cde',
    amount: BigNumber.from('128106015354872300000'),
  },
  {
    tokenIn: YSDAI6MMS_V1,
    tokenOut: YSDAI6MMS,
    merkleRoot: '0xd1bf5bb277cc07ba1e49c076b1daa78c01898e643dcda902e869b817dc35ebb3',
    amount: BigNumber.from('516290007194613000000000'),
  },
  {
    tokenIn: YSUSDC6MMS_V1,
    tokenOut: YSUSDC6MMS,
    merkleRoot: '0x57073b24614c005347d0a44d046ae96a82d5ae5df60ac16ff696c5bd49d8e5f5',
    amount: BigNumber.from('926769085322'),
  },
]