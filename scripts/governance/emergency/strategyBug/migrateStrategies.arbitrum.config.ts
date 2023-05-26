import { ETH, DAI, USDC, USDT } from '../../../../shared/constants'
import { ACCUMULATOR } from '../../../../shared/constants'
import { ONEUSDC } from '../../../../shared/constants'
import { FYETH2306, FYETH2309, FYDAI2306, FYDAI2309, FYUSDC2306, FYUSDC2309, FYUSDT2306, FYUSDT2309 } from '../../../../shared/constants'
import { YSETH6MJD, YSETH6MMS, YSDAI6MJD, YSDAI6MMS, YSUSDC6MJD, YSUSDC6MMS, YSUSDT6MJD, YSUSDT6MMS } from '../../../../shared/constants'
import { YSETH6MJD_V2, YSETH6MMS_V2, YSDAI6MJD_V2, YSDAI6MMS_V2, YSUSDC6MJD_V2, YSUSDC6MMS_V2, YSUSDT6MJD_V2, YSUSDT6MMS_V2 } from '../../../../shared/constants'

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

import { Series, Strategy } from '../../confTypes'

export const ONEUSDT = ONEUSDC

const eth = base_config.bases.get(ETH)!
const ethIlks = base_config.ilks.get(ETH)!
const dai = base_config.bases.get(DAI)!
const daiIlks = base_config.ilks.get(DAI)!
const usdc = base_config.bases.get(USDC)!
const usdcIlks = base_config.ilks.get(USDC)!
const usdt = base_config.bases.get(USDT)!
const usdtIlks = base_config.ilks.get(USDT)!

const fyETH2306: Series = {
  seriesId: FYETH2306,
  base: eth,
  fyToken: {
    assetId: FYETH2306,
    address: fyTokens.getOrThrow(FYETH2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2306,
    address: pools.getOrThrow(FYETH2306)!,
  },
  ilks: ethIlks,
}

const fyETH2309: Series = {
  seriesId: FYETH2309,
  base: eth,
  fyToken: {
    assetId: FYETH2309,
    address: fyTokens.getOrThrow(FYETH2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYETH2309,
    address: pools.getOrThrow(FYETH2309)!,
  },
  ilks: ethIlks,
}

const fyDAI2306: Series = {
  seriesId: FYDAI2306,
  base: dai,
  fyToken: {
    assetId: FYDAI2306,
    address: fyTokens.getOrThrow(FYDAI2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2306,
    address: pools.getOrThrow(FYDAI2306)!,
  },
  ilks: daiIlks,
}

const fyDAI2309: Series = {
  seriesId: FYDAI2309,
  base: dai,
  fyToken: {
    assetId: FYDAI2309,
    address: fyTokens.getOrThrow(FYDAI2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYDAI2309,
    address: pools.getOrThrow(FYDAI2309)!,
  },
  ilks: daiIlks,
}

const fyUSDC2306: Series = {
  seriesId: FYUSDC2306,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2306,
    address: fyTokens.getOrThrow(FYUSDC2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2306,
    address: pools.getOrThrow(FYUSDC2306)!,
  },
  ilks: usdcIlks,
}

const fyUSDC2309: Series = {
  seriesId: FYUSDC2309,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2309,
    address: fyTokens.getOrThrow(FYUSDC2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDC2309,
    address: pools.getOrThrow(FYUSDC2309)!,
  },
  ilks: usdcIlks,
}

const fyUSDT2306: Series = {
  seriesId: FYUSDT2306,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2306,
    address: fyTokens.getOrThrow(FYUSDT2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2306,
    address: pools.getOrThrow(FYUSDT2306)!,
  },
  ilks: usdtIlks,
}

const fyUSDT2309: Series = {
  seriesId: FYUSDT2309,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2309,
    address: fyTokens.getOrThrow(FYUSDT2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: FYUSDT2309,
    address: pools.getOrThrow(FYUSDT2309)!,
  },
  ilks: usdtIlks,
}

export const newSeries: Series[] = [fyETH2306, fyETH2309, fyDAI2306, fyDAI2309, fyUSDC2306, fyUSDC2309, fyUSDT2306, fyUSDT2309]

const ysETH6MJD: Strategy = {
  assetId: YSETH6MJD,
  address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  base: eth,
  seriesToInvest: fyETH2306,
}

const ysETH6MMS: Strategy = {
  assetId: YSETH6MMS,
  address: strategyAddresses.getOrThrow(YSETH6MMS)!,
  base: eth,
  seriesToInvest: fyETH2309,
}

const ysDAI6MJD: Strategy = {
  assetId: YSDAI6MJD,
  address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  base: dai,
  seriesToInvest: fyDAI2306,
}

const ysDAI6MMS: Strategy = {
  assetId: YSDAI6MMS,
  address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  base: dai,
  seriesToInvest: fyDAI2309,
}

const ysUSDC6MJD: Strategy = {
  assetId: YSUSDC6MJD,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  base: usdc,
  seriesToInvest: fyUSDC2306,
}

const ysUSDC6MMS: Strategy = {
  assetId: YSUSDC6MMS,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  base: usdc,
  seriesToInvest: fyUSDC2309,
}

const ysUSDT6MJD: Strategy = {
  assetId: YSUSDT6MJD,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  base: usdt,
  seriesToInvest: fyUSDT2306,
}

const ysUSDT6MMS: Strategy = {
  assetId: YSUSDT6MMS,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  base: usdt,
  seriesToInvest: fyUSDT2309,
}

export const newStrategies: Strategy[] = [ysETH6MJD, ysETH6MMS, ysDAI6MJD, ysDAI6MMS, ysUSDC6MJD, ysUSDC6MMS, ysUSDT6MJD, ysUSDT6MMS]

// ----- mock series and old strategies -----

// The mock strategies are the current ones on arbitrum, but the pool they are traded in is actually the new strategies that we are migrating to.
const mockFYETH2306: Series = {
  seriesId: FYETH2306,
  base: eth,
  fyToken: {
    assetId: FYETH2306,
    address: fyTokens.getOrThrow(FYETH2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSETH6MJD, 
    address: strategyAddresses.getOrThrow(YSETH6MJD)!,
  },
  ilks: ethIlks,
}

const mockFYETH2309: Series = {
  seriesId: FYETH2309,
  base: eth,
  fyToken: {
    assetId: FYETH2309,
    address: fyTokens.getOrThrow(FYETH2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSETH6MMS,
    address: strategyAddresses.getOrThrow(YSETH6MMS)!,
  },
  ilks: ethIlks,
}

const mockFYDAI2306: Series = {
  seriesId: FYDAI2306,
  base: dai,
  fyToken: {
    assetId: FYDAI2306,
    address: fyTokens.getOrThrow(FYDAI2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSDAI6MJD,
    address: strategyAddresses.getOrThrow(YSDAI6MJD)!,
  },
  ilks: daiIlks,
}

const mockFYDAI2309: Series = {
  seriesId: FYDAI2309,
  base: dai,
  fyToken: {
    assetId: FYDAI2309,
    address: fyTokens.getOrThrow(FYDAI2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSDAI6MMS,
    address: strategyAddresses.getOrThrow(YSDAI6MMS)!,
  },
  ilks: daiIlks,
}

const mockFYUSDC2306: Series = {
  seriesId: FYUSDC2306,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2306,
    address: fyTokens.getOrThrow(FYUSDC2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSUSDC6MJD,
    address: strategyAddresses.getOrThrow(YSUSDC6MJD)!,
  },
  ilks: usdcIlks,
}

const mockFYUSDC2309: Series = {
  seriesId: FYUSDC2309,
  base: usdc,
  fyToken: {
    assetId: FYUSDC2309,
    address: fyTokens.getOrThrow(FYUSDC2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSUSDC6MMS,
    address: strategyAddresses.getOrThrow(YSUSDC6MMS)!,
  },
  ilks: usdcIlks,
}

const mockFYUSDT2306: Series = {
  seriesId: FYUSDT2306,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2306,
    address: fyTokens.getOrThrow(FYUSDT2306)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSUSDT6MJD,
    address: strategyAddresses.getOrThrow(YSUSDT6MJD)!,
  },
  ilks: usdtIlks,
}

const mockFYUSDT2309: Series = {
  seriesId: FYUSDT2309,
  base: usdt,
  fyToken: {
    assetId: FYUSDT2309,
    address: fyTokens.getOrThrow(FYUSDT2309)!,
  },
  chiOracle: protocol.getOrThrow(ACCUMULATOR)!,
  pool: {
    assetId: YSUSDT6MMS,
    address: strategyAddresses.getOrThrow(YSUSDT6MMS)!,
  },
  ilks: usdtIlks,
}

export const mockSeries: Series[] = [mockFYETH2306, mockFYETH2309, mockFYDAI2306, mockFYDAI2309, mockFYUSDC2306, mockFYUSDC2309, mockFYUSDT2306, mockFYUSDT2309]

// The old stratetegies have now the mock series as the series to invest in, which means they will pour their assets into the new strategies and become wrappers for them.
const ysETH6MJDv2: Strategy = {
  assetId: YSETH6MJD_V2,
  address: strategyAddresses.getOrThrow(YSETH6MJD_V2)!,
  base: eth,
  seriesToInvest: mockFYETH2306,
}

const ysETH6MMSv2: Strategy = {
  assetId: YSETH6MMS_V2,
  address: strategyAddresses.getOrThrow(YSETH6MMS_V2)!,
  base: eth,
  seriesToInvest: mockFYETH2309,
}

const ysDAI6MJDv2: Strategy = {
  assetId: YSDAI6MJD_V2,
  address: strategyAddresses.getOrThrow(YSDAI6MJD_V2)!,
  base: dai,
  seriesToInvest: mockFYDAI2306,
}

const ysDAI6MMSv2: Strategy = {
  assetId: YSDAI6MMS_V2,
  address: strategyAddresses.getOrThrow(YSDAI6MMS_V2)!,
  base: dai,
  seriesToInvest: mockFYDAI2309,
}

const ysUSDC6MJDv2: Strategy = {
  assetId: YSUSDC6MJD_V2,
  address: strategyAddresses.getOrThrow(YSUSDC6MJD_V2)!,
  base: usdc,
  seriesToInvest: mockFYUSDC2306,
}

const ysUSDC6MMSv2: Strategy = {
  assetId: YSUSDC6MMS_V2,
  address: strategyAddresses.getOrThrow(YSUSDC6MMS_V2)!,
  base: usdc,
  seriesToInvest: mockFYUSDC2309,
}

const ysUSDT6MJDv2: Strategy = {
  assetId: YSUSDT6MJD_V2,
  address: strategyAddresses.getOrThrow(YSUSDT6MJD_V2)!,
  base: usdt,
  seriesToInvest: mockFYUSDT2306,
}

const ysUSDT6MMSv2: Strategy = {
  assetId: YSUSDT6MMS_V2,
  address: strategyAddresses.getOrThrow(YSUSDT6MMS_V2)!,
  base: usdt,
  seriesToInvest: mockFYUSDT2309,
}

export const oldStrategies = [ysETH6MJDv2, ysETH6MMSv2, ysDAI6MJDv2, ysDAI6MMSv2, ysUSDC6MJDv2, ysUSDC6MMSv2, ysUSDT6MJDv2, ysUSDT6MMSv2]