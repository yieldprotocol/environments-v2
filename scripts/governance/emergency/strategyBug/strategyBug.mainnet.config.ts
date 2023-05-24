import { BigNumber } from 'ethers'
import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSUSDT6MJD, YSETH6MMS, YSDAI6MMS, YSUSDC6MMS, YSUSDT6MMS } from '../../../../shared/constants'

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
export const strategyAddresses: Map<string, string> = base_config.strategyAddresses

export const series: Map<string, Series> = base_config.series
export const strategies: Map<string, Strategy> = base_config.strategies

import { Series, Strategy, Transfer } from '../../confTypes'

const eth = base_config.bases.getOrThrow(ETH)!
const dai = base_config.bases.getOrThrow(DAI)!
const usdc = base_config.bases.getOrThrow(USDC)!
const usdt = base_config.bases.getOrThrow(USDT)!

const ysETH6MJD: Strategy = {
  assetId: YSETH6MJD,
  address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  base: eth,
}

const ysDAI6MJD: Strategy = {
  assetId: YSDAI6MJD,
  address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  base: dai,
}

const ysUSDC6MJD: Strategy = {
  assetId: YSUSDC6MJD,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  base: usdc,
}

const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  base: usdt,
}

const ysETH6MMS: Strategy = {
  assetId: YSETH6MMS,
  address: strategyAddresses.getOrThrow(YSETH6MMS)!,
  base: eth,
}

const ysDAI6MMS: Strategy = {
  assetId: YSDAI6MMS,
  address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  base: dai,
}

const ysUSDC6MMS: Strategy = {
  assetId: YSUSDC6MMS,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  base: usdc,
}

const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
}


export const newStrategies: Strategy[] = [ysETH6MJD, ysDAI6MJD, ysUSDC6MJD, ysUSDT6MJD, ysETH6MMS, ysDAI6MMS, ysUSDC6MMS, ysUSDT6MMS]

export const baseTransfers: Array<Transfer> = [
  {
    token: eth,
    receiver: ysETH6MJD.address,
    amount: BigNumber.from('51137393239489811000'),
  },
  {
    token: eth,
    receiver: ysETH6MMS.address,
    amount: BigNumber.from('49327204851976035852'),
  },
  {
    token: dai,
    receiver: ysDAI6MJD.address,
    amount: BigNumber.from('67138863944130937500000'),
  },
  {
    token: dai,
    receiver: ysDAI6MMS.address,
    amount: BigNumber.from('156183244062664555398025'),
  },
  {
    token: usdc,
    receiver: ysUSDC6MJD.address,
    amount: BigNumber.from('482374497345'),
  },
  {
    token: usdc,
    receiver: ysUSDC6MMS.address,
    amount: BigNumber.from('482422771667'),
  },
]

export const strategyTransfers: Array<Transfer> = [
  {
    token: ysETH6MJD,
    receiver: ysETH6MJD.address,
    amount: BigNumber.from('173876717527907390911'),
  },
  {
    token: ysETH6MMS,
    receiver: ysETH6MMS.address,
    amount: BigNumber.from('128106015354872300000'),
  },
  {
    token: ysDAI6MJD,
    receiver: ysDAI6MJD.address,
    amount: BigNumber.from('182026100521581669692081'),
  },
  {
    token: ysDAI6MMS,
    receiver: ysDAI6MMS.address,
    amount: BigNumber.from('516290007194613000000000'),
  },
  {
    token: ysUSDC6MJD,
    receiver: ysUSDC6MJD.address,
    amount: BigNumber.from('647405622307'),
  },
  {
    token: ysUSDC6MMS,
    receiver: ysUSDC6MMS.address,
    amount: BigNumber.from('926769085322'),
  },
]

export const transfers: Array<Transfer> = baseTransfers