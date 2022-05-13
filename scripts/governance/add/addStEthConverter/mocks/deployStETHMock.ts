import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { getOwnerOrImpersonate, verify, writeAddressMap } from '../../../../../shared/helpers'

import StETHMockArtifact from '../../../../../artifacts/contracts/::mocks/StETHMock.sol/StETHMock.json'
import { StETHMock } from '../../../../../typechain/StETHMock'

const { deployContract } = waffle
const { protocol, developer } = require(process.env.CONF as string)
/**
 * @dev This script deploys the stETHMock contract
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy stETHMock on mainnet"
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // let stETH = (await deployContract(ownerAcc, StETHMockArtifact)) as StETHMock
  // console.log(`stETHMock deployed at ${stETH.address}`)
  // verify(stETH.address, [])

  let stETH: StETHMock

  if (protocol.get('wstethMock') === undefined) {
    stETH = (await deployContract(ownerAcc, StETHMockArtifact)) as StETHMock
    console.log(`stETHMock, '${stETH.address}`)
    verify(stETH.address, [])
    protocol.set('stETHMock', stETH.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    stETH = (await ethers.getContractAt(
      'StETHMock',
      protocol.get('stETHMock') as string,
      ownerAcc
    )) as unknown as StETHMock
    console.log(`Reusing StETHMock at ${stETH.address}`)
  }
})()
