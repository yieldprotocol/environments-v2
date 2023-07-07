import { BigNumber } from 'ethers'
import { ETH, DAI, USDC } from '../../../../shared/constants'

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

import { Transfer } from '../../confTypes'

export const eth = base_config.bases.get(ETH)!
export const dai = base_config.bases.get(DAI)!
export const usdc = base_config.bases.get(USDC)!


export const transfers: Array<Transfer> = [
  {
    token: eth,
    receiver: '0xA85821C91F16285173d3B3DA59605afcE29B227B',
    amount: BigNumber.from('201908389762257038'),
  },
  {
    token: eth,
    receiver: '0x4beAd5Fc18eA31Bd5149a5081b42F034E200E9E4',
    amount: BigNumber.from('15121039662011668'),
  },
  {
    token: dai,
    receiver: '0xf67336E671f1588d71c8f1e50a79c2715717E07a',
    amount: BigNumber.from('3035694711795483672094'),
  },
  {
    token: usdc,
    receiver: '0xDA030d6674812F4EfD4CAE4Bd6AC15073be57d48',
    amount: BigNumber.from('201451630623'),
  },
  {
    token: usdc,
    receiver: '0x4B80e11D2410F2029aE73628603840dfFbF885Aa',
    amount: BigNumber.from('1029276714'),
  },
  {
    token: usdc,
    receiver: '0x31ecB0819346Edd4Ac31E2C3aDACD6629e411A78',
    amount: BigNumber.from('1026134593'),
  },
  {
    token: usdc,
    receiver: '0xc7Ad199Ecd0e20b3c10c724104a2033e140529F9',
    amount: BigNumber.from('107957156'),
  },
  {
    token: usdc,
    receiver: '0x7663F7ba9816157cb2E6Ea9364a355bc8Ed0F38D',
    amount: BigNumber.from('63316823'),
  },
]