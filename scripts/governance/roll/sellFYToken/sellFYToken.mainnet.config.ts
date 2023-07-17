import { BigNumber } from 'ethers'
import { ETH, DAI, USDC } from '../../../../shared/constants'
import { ONEUSDC } from '../../../../shared/constants'
import { FYETH2312, FYDAI2312, FYUSDC2312 } from '../../../../shared/constants'

import * as base_config from '../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployers: Map<string, string> = base_config.deployers

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const pools: Map<string, string> = base_config.pools
export const strategyAddresses: Map<string, string> = base_config.strategyAddresses

export const series: Map<string, Series> = base_config.series
export const strategies: Map<string, Strategy> = base_config.strategies

import { Series, Strategy, Transfer } from '../../confTypes'

export const ONEUSDT = ONEUSDC

const eth = base_config.bases.get(ETH)!
const dai = base_config.bases.get(DAI)!
const usdc = base_config.bases.get(USDC)!

/// @dev Move underlying from pools to joins by selling fyToken. Sell to the new pools as much fyToken as the outgoing pools have in the cache.
export const fyTokenSelling: Transfer[] = [
  {
    token: eth,
    amount: BigNumber.from('37297846383822840594'),
    receiver: pools.getOrThrow(FYETH2312)!,
  },
  {
    token: dai,
    amount: BigNumber.from('19104898370295136114938'),
    receiver: pools.getOrThrow(FYDAI2312)!,
  },
  {
    token: usdc,
    amount: BigNumber.from('173347007751'),
    receiver: pools.getOrThrow(FYUSDC2312)!,
  },
]