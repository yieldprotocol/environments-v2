import { WAD, ETH, DAI, USDC, WBTC } from '../../shared/constants'
import { stringToBytes6 } from '../../shared/helpers'

export const CHAINLINK = 'CHAINLINK'
export const COMPOSITE = 'COMPOSITE'

// Assets to add to the protocol. A Join will be deployed for each one.
export const assetIds: string[] = [DAI, USDC, ETH, WBTC]

// Assets to make into underlyings. The assets must exist, as well as rate and chi oracle sources.
export const baseIds: string[] = [DAI, USDC]

// Spot oracle pairs, either to use directly as part of an ilkId pair, or as intermediate steps in a composite oracle path
export const spotPairs: Array<[string, string, number]> = [
  [DAI, DAI, 18], // Constant 1
  [DAI, ETH, 18],
  [USDC, USDC, 18], // Constant 1
  [USDC, ETH, 18],
  [USDT, 18], // Constant 1
  [USDT, ETH, 18],
  [WBTC, ETH, 18], // Only needed for a composite path
]
