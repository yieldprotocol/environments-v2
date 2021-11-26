import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify } from '../../../../shared/helpers'

import WstETHMockArtifact from '../../../../artifacts/contracts/mocks/WstETHMock.sol/WstETHMock.json'
import { WstETHMock } from '../../../../typechain/WstETHMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the WstETHMock contract
 */

;(async () => {
  const stEthAddress = '0x7188e9DBdDf607474a44c653C693Aab99dB92a16'

  if (hre.network.name === 'mainnet') throw "You shouldn't deploy WstETHMock on mainnet"
  const [ ownerAcc ] = await ethers.getSigners();

  let wstETH = (await deployContract(ownerAcc, WstETHMockArtifact, [stEthAddress])) as WstETHMock
  console.log(`WstETHMock deployed at '${wstETH.address}`)
  verify(wstETH.address, [stEthAddress])
  await wstETH.set('1046430920451237951')
})()
