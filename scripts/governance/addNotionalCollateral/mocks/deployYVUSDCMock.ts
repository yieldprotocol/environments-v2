import { ethers, waffle } from 'hardhat'
import { verify } from '../../../../shared/helpers'

import YvTokenMockArtifact from '../../../../../artifacts/contracts/mocks/YvTokenMock.sol/YvTokenMock.json'
import { YvTokenMock } from '../../../../../typechain/YvTokenMock'

import { USDC } from '../../../../shared/constants'
import { assets } from '../addFCash.mainnet.config'

const { deployContract } = waffle

/**
 * @dev This script deploys the YvTokenMock contract
 * @notice Not used for mainnet
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  let yvUSDC: YvTokenMock
  const args = ['USDC yVault', 'yvUSDC', 6, assets.get(USDC) as string]
  yvUSDC = (await deployContract(ownerAcc, YvTokenMockArtifact, args)) as YvTokenMock
  console.log(`YvUSDCMock, ${yvUSDC.address}`)
  verify(yvUSDC.address, args)

  await yvUSDC.set(1089925)
})()
