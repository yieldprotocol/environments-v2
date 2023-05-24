import { BigNumber } from 'ethers'
import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSUSDT6MJD, YSETH6MMS, YSDAI6MMS, YSUSDC6MMS, YSUSDT6MMS } from '../../../../shared/constants'

import * as base_config from '../../base.arb_mainnet.config'

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
export const strategyAddresses: Map<string, string> = base_config.strategyAddresses

export const series: Map<string, Series> = base_config.series
export const strategies: Map<string, Strategy> = base_config.strategies

import { Series, Strategy, Transfer } from '../../confTypes'

export const eth = base_config.bases.getOrThrow(ETH)!
export const dai = base_config.bases.getOrThrow(DAI)!
export const usdc = base_config.bases.getOrThrow(USDC)!
export const usdt = base_config.bases.getOrThrow(USDT)!

export const ysETH6MJD: Strategy = {
  assetId: YSETH6MJD,
  address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  base: eth,
}

export const ysDAI6MJD: Strategy = {
  assetId: YSDAI6MJD,
  address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  base: dai,
}

export const ysUSDC6MJD: Strategy = {
  assetId: YSUSDC6MJD,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  base: usdc,
}

export const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  base: usdt,
}

export const ysETH6MMS: Strategy = {
  assetId: YSETH6MMS,
  address: strategyAddresses.getOrThrow(YSETH6MMS)!,
  base: eth,
}

export const ysDAI6MMS: Strategy = {
  assetId: YSDAI6MMS,
  address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  base: dai,
}

export const ysUSDC6MMS: Strategy = {
  assetId: YSUSDC6MMS,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  base: usdc,
}

export const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
}


export const newStrategies: Strategy[] = [ysETH6MJD, ysDAI6MJD, ysUSDC6MJD, ysUSDT6MJD, ysETH6MMS, ysDAI6MMS, ysUSDC6MMS, ysUSDT6MMS]

export const baseTransfers: Array<Transfer> = [
  {
    token: eth,
    receiver: ysETH6MJD.address,
    amount: BigNumber.from('10367786613585443392'),
  },
  {
    token: eth,
    receiver: ysETH6MMS.address,
    amount: BigNumber.from('1963210795442783'),
  },
  {
    token: dai,
    receiver: ysDAI6MJD.address,
    amount: BigNumber.from('3709238956934868533949'),
  },
  {
    token: dai,
    receiver: ysDAI6MMS.address,
    amount: BigNumber.from('3230573987695534058414'),
  },
  {
    token: usdc,
    receiver: ysUSDC6MJD.address,
    amount: BigNumber.from('68198721781'),
  },
  {
    token: usdc,
    receiver: ysUSDC6MMS.address,
    amount: BigNumber.from('30421437949'),
  },
  {
    token: usdt,
    receiver: ysUSDT6MJD.address,
    amount: BigNumber.from('6557297000'),
  },
  {
    token: usdt,
    receiver: ysUSDT6MMS.address,
    amount: BigNumber.from('3613978962'),
  },
]

export const transfers: Array<Transfer> = baseTransfers