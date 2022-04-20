import { ethers, waffle } from 'hardhat'
import { verify } from '../../../../shared/helpers'

import ERC1155MockArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/other/notional/ERC1155Mock.sol/ERC1155Mock.json'

import { ERC1155Mock } from '../../../../typechain/ERC1155Mock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ERC1155Mock contract
 * @notice Not used for mainnet
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  let erc1155Mock: ERC1155Mock
  erc1155Mock = (await deployContract(ownerAcc, ERC1155MockArtifact, [])) as ERC1155Mock
  console.log(`ERC1155Mock, ${erc1155Mock.address}`)
  verify(erc1155Mock.address, [])
})()
