import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../../../shared/helpers'

import ERC20MockArtifact from '../../../../../../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import { ERC20Mock } from '../../../../../../typechain/ERC20Mock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ERC20Mock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy ERC20Mock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  const args = ['Gnosis Token', 'GNO']
  let link = (await deployContract(ownerAcc, ERC20MockArtifact, args)) as ERC20Mock
  console.log(`ERC20Mock deployed at '${link.address}`)
  verify(link.address, args)
})()
