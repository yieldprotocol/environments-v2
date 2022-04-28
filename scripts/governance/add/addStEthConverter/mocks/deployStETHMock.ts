import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../../shared/helpers'

import StETHMockArtifact from '../../../../../artifacts/contracts/::mocks/StETHMock.sol/StETHMock.json'
import { StETHMock } from '../../../../../typechain/StETHMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the stETHMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy stETHMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  let stETH = (await deployContract(ownerAcc, StETHMockArtifact)) as StETHMock
  console.log(`stETHMock deployed at ${stETH.address}`)
  verify(stETH.address, [])
})()
