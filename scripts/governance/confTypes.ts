import { BigNumber } from 'ethers'

export interface AuctionLineAndLimit {
  baseId: string
  ilkId: string
  duration: number
  vaultProportion: BigNumber
  collateralProportion: BigNumber
  max: BigNumber
}
