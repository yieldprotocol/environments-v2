import { BigNumber } from 'ethers'
import { FactoryOptions } from 'hardhat/types'

export interface AuctionLineAndLimit {
  baseId: string
  ilkId: string
  duration: number
  vaultProportion: BigNumber
  collateralProportion: BigNumber
  max: BigNumber
}

export interface ContractDeployment {
  addressFile: string // The json file to store the address in
  name: string // The unique name to the contract
  contract: string // The contract name to deploy
  args: string[]
  libs?: FactoryOptions
}
