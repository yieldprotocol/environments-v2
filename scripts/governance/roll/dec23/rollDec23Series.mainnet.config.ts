import { BigNumber } from 'ethers'
import { ETH, DAI, USDC, TRADER_DXDY } from '../../../../shared/constants'
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

export const newSeries: Series[] = [base_config.fyETH2312, base_config.fyDAI2312, base_config.fyUSDC2312, base_config.fyUSDT2312]

export const rollStrategies: Strategy[] = [base_config.ysETH6MJD, base_config.ysDAI6MJD, base_config.ysUSDC6MJD, base_config.ysUSDT6MJD]

/// @dev Fund the Trader contract for expected costs of moving underlying from pools to joins
export const traderFunding: Transfer[] = [
  {
    token: eth,
    amount: BigNumber.from('700000000000000000'),
    receiver: protocol.getOrThrow(TRADER_DXDY)!,
  },
  {
    token: dai,
    amount: BigNumber.from('600000000000000000000'),
    receiver: protocol.getOrThrow(TRADER_DXDY)!,
  },
  {
    token: usdc,
    amount: BigNumber.from('8000000000'),
    receiver: protocol.getOrThrow(TRADER_DXDY)!,
  },
]

/// @dev Move underlying from pools to joins by selling fyToken. Sell to the new pools as much fyToken as the outgoing pools have in the cache.
export const fyTokenSelling: Transfer[] = [
  {
    token: eth,
    amount: BigNumber.from('45005109457847530879'),
    receiver: pools.getOrThrow(FYETH2312)!,
  },
  {
    token: dai,
    amount: BigNumber.from('62980679860265824054193'),
    receiver: pools.getOrThrow(FYDAI2312)!,
  },
  {
    token: usdc,
    amount: BigNumber.from('377990123050'),
    receiver: pools.getOrThrow(FYUSDC2312)!,
  },
]

export const timelockFunding = traderFunding