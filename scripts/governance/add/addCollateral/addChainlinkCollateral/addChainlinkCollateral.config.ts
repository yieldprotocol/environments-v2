import { ETH, DAI, USDC, FRAX, GNO } from '../../../../../shared/constants'
import {
  FYETH2206,
  FYDAI2206,
  FYUSDC2206,
  FYFRAX2206,
  FYETH2209,
  FYDAI2209,
  FYUSDC2209,
  FYFRAX2209,
} from '../../../../../shared/constants'

import * as base_config from '../../../base.rinkeby.config'

export const chainId: number = base_config.chainId
export const whales: Map<string, string> = base_config.whales

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const assets: Map<string, string> = base_config.assets
export const joins: Map<string, string> = base_config.joins
export const newJoins: Map<string, string> = base_config.newJoins
export const newFYTokens: Map<string, string> = base_config.newFYTokens
export const newPools: Map<string, string> = base_config.newPools
export const newStrategies: Map<string, string> = base_config.newStrategies

export const additionalDevelopers: Array<string> = []

// Assets for which we will have a Join
export const assetsToAdd: Array<[string, string]> = [
  [GNO, assets.get(GNO) as string],
]

// Input data: baseId, ilkId, ratio (1000000 == 100%), line, dust, dec
export const chainlinkDebtLimits: Array<[string, string, number, number, number, number]> = [
  [ETH, GNO, 1670000, 250000000, 10000, 12],
  [DAI, GNO, 1670000, 1000000, 5000, 18],
  [USDC, GNO, 1670000, 1000000, 5000, 6],
  [FRAX, GNO, 1670000, 1000000, 5000, 18],
]

// seriesId, accepted ilks
export const seriesIlks: Array<[string, string[]]> = [
  [FYETH2206, [GNO]],
  [FYDAI2206, [GNO]],
  [FYUSDC2206, [GNO]],
  [FYFRAX2206, [GNO]],
  [FYETH2209, [GNO]],
  [FYDAI2209, [GNO]],
  [FYUSDC2209, [GNO]],
  [FYFRAX2209, [GNO]],
]