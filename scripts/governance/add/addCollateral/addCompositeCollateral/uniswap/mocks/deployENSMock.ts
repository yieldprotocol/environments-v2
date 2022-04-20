import { ethers, waffle } from 'hardhat'
import { verify, getOriginalChainId } from '../../../../shared/helpers'

import ERC20MockArtifact from '../../../../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import { ERC20Mock } from '../../../../typechain/ERC20Mock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ENSMock contract
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  let ens: ERC20Mock
  const args = ['Ethereum Name Service', 'ENS']
  ens = (await deployContract(ownerAcc, ERC20MockArtifact, args)) as ERC20Mock
  console.log(`ENSMock, '${ens.address}`)
  verify(ens.address, args)
})()
