import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../../shared/helpers'

import ConvexStakingWrapperYieldMockArtifact from '../../../../../artifacts/contracts/mocks/ConvexStakingWrapperYieldMock.sol/ConvexStakingWrapperYieldMock.json'
import { ConvexStakingWrapperYieldMock } from '../../../../../typechain/ConvexStakingWrapperYieldMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ConvexStakingWrapperYieldMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy ConvexStakingWrapperYieldMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  const args = ['', '', '', '', '', '', '', '']
  let convexStakingWrapperYieldMock = (await deployContract(
    ownerAcc,
    ConvexStakingWrapperYieldMockArtifact,
    args
  )) as ConvexStakingWrapperYieldMock
  console.log(`ConvexStakingWrapperYieldMock deployed at '${convexStakingWrapperYieldMock.address}`)
  verify(convexStakingWrapperYieldMock.address, args)
})()
