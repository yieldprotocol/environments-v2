import { ethers, BigNumber } from 'ethers'

export const DEC6 = BigNumber.from(10).pow(6)
export const WAD = BigNumber.from(10).pow(18)
export const RAY = BigNumber.from(10).pow(27)
export const MAX128 = BigNumber.from(2).pow(128).sub(1)
export const MAX256 = BigNumber.from(2).pow(256).sub(1)
export const THREE_MONTHS: number = 3 * 30 * 24 * 60 * 60

export const ETH = ethers.utils.formatBytes32String('ETH').slice(0, 14)
export const DAI = ethers.utils.formatBytes32String('DAI').slice(0, 14)
export const USDC = ethers.utils.formatBytes32String('USDC').slice(0, 14)
export const WBTC = ethers.utils.formatBytes32String('WBTC').slice(0, 14)
export const USDT = ethers.utils.formatBytes32String('USDT').slice(0, 14)

export const YIELDSPACE_OPS = {
  ROUTE:              0,
  TRANSFER_TO_POOL:   1,
  FORWARD_PERMIT:     2,
  FORWARD_DAI_PERMIT: 3,
  JOIN_ETHER:         4,
  EXIT_ETHER:         5,
}

export const ONE64 = BigNumber.from('18446744073709551616') // In 64.64 format
export const secondsInOneYear = BigNumber.from(31557600)
export const secondsInTenYears = secondsInOneYear.mul(10) // Seconds in 10 years
export const k = ONE64.div(secondsInTenYears)

export const g0 = ONE64 // No fees
export const g1 = ONE64.mul(950).div(1000) // Sell base to the pool
export const g2 = ONE64.mul(1000).div(950) // Sell fyToken to the pool

export const VAULT_OPS = {
  BUILD:                0,
  TWEAK:                1,
  GIVE:                 2,
  DESTROY:              3,
  STIR:                 4,
  POUR:                 5,
  SERVE:                6,
  ROLL:                 7,
  CLOSE:                8,
  REPAY:                9,
  REPAY_VAULT:          10,
  REPAY_LADLE:          11,
  RETRIEVE:             12,
  FORWARD_PERMIT:       13,
  FORWARD_DAI_PERMIT:   14,
  JOIN_ETHER:           15,
  EXIT_ETHER:           16,
  TRANSFER_TO_POOL:     17,
  ROUTE:                18,
  TRANSFER_TO_FYTOKEN:  19,
  REDEEM:               20,
  MODULE:               21,
}

export const CHI = ethers.utils.formatBytes32String('chi').slice(0, 14)
export const RATE = ethers.utils.formatBytes32String('rate').slice(0, 14)

