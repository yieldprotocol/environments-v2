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

export const YIELDSPACE_OPS = {
  ROUTE: 0,
  TRANSFER_TO_POOL: 1,
  FORWARD_PERMIT: 2,
  FORWARD_DAI_PERMIT: 3,
  JOIN_ETHER: 4,
  EXIT_ETHER: 5
  }

export const VAULT_OPS = {
  BUILD:                0,
  TWEAK:                1,
  GIVE:                 2,
  DESTROY:              3,
  STIR_TO:              4,
  STIR_FROM:            5,
  POUR:                 6,
  SERVE:                7,
  ROLL:                 8,
  CLOSE:                9,
  REPAY:                10,
  REPAY_VAULT:          11,
  FORWARD_PERMIT:       12,
  FORWARD_DAI_PERMIT:   13,
  JOIN_ETHER:           14,
  EXIT_ETHER:           15,
  TRANSFER_TO_POOL:     16,
  ROUTE:                17,
  TRANSFER_TO_FYTOKEN:  18,
  REDEEM:               19,
  }

