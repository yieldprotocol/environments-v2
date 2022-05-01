import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import WETH9MockArtifact from '../../../artifacts/contracts/::mocks/WETH9Mock.sol/WETH9Mock.json'

import { WETH9Mock } from '../../../typechain/WETH9Mock'
const { deployContract } = waffle

/**
 * @dev This script deploys a WETH9 Mock
 */

;(async () => {
  let [ownerAcc] = await ethers.getSigners()

  const args: any = []
  const asset = (await deployContract(ownerAcc, WETH9MockArtifact, args)) as unknown as WETH9Mock
  await asset.deployed()
  console.log(`${await asset.symbol()} deployed at ${asset.address}`)
  verify(asset.address, args)
})()
