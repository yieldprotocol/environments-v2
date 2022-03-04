import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import USDCMockArtifact from '../../../artifacts/contracts/::mocks/USDCMock.sol/USDCMock.json'

import { USDCMock } from '../../../typechain/USDCMock'
const { deployContract } = waffle

/**
 * @dev This script deploys a USDC Mock
 */

;(async () => {
  let [ownerAcc] = await ethers.getSigners()

  const args: any = []
  const asset = (await deployContract(ownerAcc, USDCMockArtifact, args)) as unknown as USDCMock
  await asset.deployed()
  console.log(`${await asset.symbol()} deployed at ${asset.address}`)
  verify(asset.address, args)
})()
