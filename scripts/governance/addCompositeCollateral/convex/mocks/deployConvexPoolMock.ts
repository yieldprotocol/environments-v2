import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../../shared/helpers'

import ConvexPoolMockArtifact from '../../../../../artifacts/contracts/mocks/ConvexPoolMock.sol/ConvexPoolMock.json'
import { ConvexPoolMock } from '../../../../../typechain/ConvexPoolMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ConvexPoolMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy ConvexPoolMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  const args = ['Uniswap', 'UNI']
  let convexPoolMock = (await deployContract(ownerAcc, ConvexPoolMockArtifact,args)) as ConvexPoolMock
  console.log(`ConvexPoolMock deployed at '${convexPoolMock.address}`)
  verify(convexPoolMock.address, args)
})()
