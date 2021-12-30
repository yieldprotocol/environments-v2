import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../../shared/helpers'

import CRVMockArtifact from '../../../../../artifacts/contracts/mocks/CRVMock.sol/CRVMock.json'
import { CRVMock } from '../../../../../typechain/CRVMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CRVMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy CRVMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  let crvMock = (await deployContract(ownerAcc, CRVMockArtifact)) as CRVMock
  console.log(`CRVMock deployed at '${crvMock.address}`)
  //Write the address to the file
  verify(crvMock.address,[])
})()
