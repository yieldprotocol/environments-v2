import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../shared/helpers'

import MKRMockArtifact from '../../../../artifacts/contracts/mocks/MKRMock.sol/MKRMock.json'
import { MKRMock } from '../../../../typechain/MKRMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the MKRMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy MKRMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  let mkr = (await deployContract(ownerAcc, MKRMockArtifact)) as MKRMock
  console.log(`MKRMock deployed at '${mkr.address}`)
  verify(mkr.address, [])
})()
