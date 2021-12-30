import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../../shared/helpers'

import Cvx3CrvMockArtifact from '../../../../../artifacts/contracts/mocks/Cvx3CrvMock.sol/Cvx3CrvMock.json'
import { Cvx3CrvMock } from '../../../../../typechain/Cvx3CrvMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the Cvx3CrvMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy Cvx3CrvMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  let cvx3CrvMock = (await deployContract(ownerAcc, Cvx3CrvMockArtifact)) as Cvx3CrvMock
  console.log(`Cvx3CrvMock deployed at '${cvx3CrvMock.address}`)
  //Write the address to the file
  verify(cvx3CrvMock.address,[])
})()
