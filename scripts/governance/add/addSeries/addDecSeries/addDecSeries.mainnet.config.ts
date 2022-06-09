import { BigNumber } from 'ethers'
import { WAD, ONEUSDC, MAX256, ONE64, secondsIn25Years } from '../../../../../shared/constants'
import { ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC } from '../../../../../shared/constants'
import { EODEC22 } from '../../../../../shared/constants'
import { FYETH2212, FYDAI2212, FYUSDC2212, FYFRAX2212 } from '../../../../../shared/constants'
import { YSETH6MJD, YSDAI6MJD, YSUSDC6MJD, YSFRAX6MJD } from '../../../../../shared/constants'
import { COMPOUND, ACCUMULATOR } from '../../../../../shared/constants'

import * as base_config from '../../../base.mainnet.config'

export const chainId: number = base_config.chainId
export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const strategies: Map<string, string> = base_config.strategies
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newJoins: Map<string, string> = base_config.newJoins
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

// Time stretch to be set in the PoolFactory prior to pool deployment
export const timeStretch: BigNumber = ONE64.div(secondsIn25Years)

// Sell base to the pool fee, as fp4
export const g1: number = 7500

// seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol
export const fyTokenData: Array<[string, string, string, string, number, string, string]> = [
  // [FYETH2212, ETH, protocol.get(COMPOUND) as string, joins.get(ETH) as string, EODEC22, 'FYETH2212', 'FYETH2212'],
  //  [FYDAI2212, DAI, protocol.get(COMPOUND) as string, joins.get(DAI) as string, EODEC22, 'FYDAI2212', 'FYDAI2212'],
  [FYUSDC2212, USDC, protocol.get(COMPOUND) as string, joins.get(USDC) as string, EODEC22, 'FYUSDC2212', 'FYUSDC2212'],
  //  [FYFRAX2212, FRAX, protocol.get(ACCUMULATOR) as string, joins.get(FRAX) as string, EODEC22, 'FYFRAX2212', 'FYFRAX2212'],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee)
export const yvPoolData: Array<[string, string, string, BigNumber, number]> = [
  [FYUSDC2212, assets.get(YVUSDC) as string, newFYTokens.get(FYUSDC2212) as string, timeStretch, g1],
]

// Parameters to deploy pools with, a pool being identified by the related seriesId
// seriesId, baseAddress, fyTokenAddress, ts (time stretch), g1 (Sell base to the pool fee)
export const nonTVPoolData: Array<[string, string, string, BigNumber, number]> = [
  [FYETH2212, assets.get(ETH) as string, newFYTokens.get(FYETH2212) as string, timeStretch, g1],
  //  [
  //    FYDAI2212,
  //    assets.get(DAI) as string,
  //    newFYTokens.get(FYDAI2212) as string,
  //    timeStretch,
  //    g1,
  //  ],
  //  [
  //    FYFRAX2212,
  //    assets.get(FRAX) as string,
  //    newFYTokens.get(FYFRAX2212) as string,
  //    timeStretch,
  //    g1,
  //  ],
]

// Amounts to initialize pools with, a pool being identified by the related seriesId
// seriesId, initAmount
export const poolsInit: Array<[string, string, BigNumber, BigNumber]> = [
  //  [FYETH2212, ETH, WAD.div(10), BigNumber.from('0')],
  //  [FYDAI2212, DAI, WAD.mul(100), BigNumber.from('0')],
  [FYUSDC2212, USDC, ONEUSDC.mul(100), BigNumber.from('0')],
  //  [FYFRAX2212, FRAX, WAD.mul(100), BigNumber.from('0')],
]

// Amount to loan to the Joins in forks. On mainnet, someone will need to deposit into a vault
// assetId, loanAmount
// export const joinLoans: Array<[string, BigNumber]> = [
//   [DAI, WAD.mul(10000)], // Join(0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc) has 751342576505567524055158 DAI, pool(0x2e4B70D0F020E62885E82bf75bc123e1Aa8c79cA) has 28060258605059358888379 fyDAI. Surplus is 723282317900508165166779 DAI
//   [USDC, ONEUSDC.mul(10000)], // Join(0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4) has 2627478782835 USDC, pool(0x80142add3A597b1eD1DE392A56B2cef3d8302797) has 86578888882 fyUSDC. Surplus is 2540899893953 USDC.
// ]

// Ilks to accept for each series
// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  //  [FYETH2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  //  [FYDAI2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
  [FYUSDC2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX, YVUSDC]],
  //  [FYFRAX2212, [ETH, DAI, USDC, WBTC, WSTETH, LINK, ENS, UNI, FRAX]],
]

// Parameters to roll each strategy
// strategyId, nextSeriesId, minRatio, maxRatio
export const rollData: Array<[string, string, BigNumber, BigNumber]> = [
  //  [YSETH6MJD, FYETH2212, BigNumber.from(0), MAX256],
  //  [YSDAI6MJD, FYDAI2212, BigNumber.from(0), MAX256],
  [YSUSDC6MJD, FYUSDC2212, BigNumber.from(0), MAX256],
  //  [YSFRAX6MJD, FYFRAX2212, BigNumber.from(0), MAX256],
]
