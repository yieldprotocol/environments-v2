import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import DaiMockArtifact from '../../../artifacts/contracts/mocks/DaiMock.sol/DaiMock.json'

import { DaiMock } from '../../../typechain/DaiMock'
const { deployContract } = waffle

/**
 * @dev This script deploys a Dai Mock
 */

;(async () => {
  let [ownerAcc] = await ethers.getSigners()

  const args: any = []
  const asset = (await deployContract(ownerAcc, DaiMockArtifact, args)) as unknown as DaiMock
  await asset.deployed()
  console.log(`${await asset.symbol()} deployed at ${asset.address}`)
  verify(asset.address, args)
})()
