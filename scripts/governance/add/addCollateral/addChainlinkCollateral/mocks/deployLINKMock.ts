import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../shared/helpers'

import LINKMockArtifact from '../../../../artifacts/contracts/mocks/LINKMock.sol/LINKMock.json'
import { LINKMock } from '../../../../typechain/LINKMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the LINKMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy LINKMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  let link = (await deployContract(ownerAcc, LINKMockArtifact)) as LINKMock
  console.log(`LINKMock deployed at '${link.address}`)
  verify(link.address, [])
})()
