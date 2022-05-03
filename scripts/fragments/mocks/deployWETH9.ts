import { ethers, waffle } from 'hardhat'
import { verify, writeAddressMap } from '../../../shared/helpers'
import WETH9MockArtifact from '../../../artifacts/contracts/::mocks/WETH9Mock.sol/WETH9Mock.json'

import { WETH9Mock } from '../../../typechain/WETH9Mock'
const { deployContract } = waffle
const { protocol } = require(process.env.CONF as string)
/**
 * @dev This script deploys a WETH9 Mock
 */

;(async () => {
  let [ownerAcc] = await ethers.getSigners()

  // const args: any = []
  // const asset = (await deployContract(ownerAcc, WETH9MockArtifact, args)) as unknown as WETH9Mock
  // await asset.deployed()
  // console.log(`${await asset.symbol()} deployed at ${asset.address}`)
  // verify(asset.address, args)

  let wethMock: WETH9Mock

  if (protocol.get('wethMock') === undefined) {
    wethMock = (await deployContract(ownerAcc, WETH9MockArtifact)) as WETH9Mock
    console.log(`wethMock, '${wethMock.address}`)
    verify(wethMock.address, [])
    protocol.set('wethMock', wethMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    wethMock = (await ethers.getContractAt(
      'WETH9Mock',
      protocol.get('wethMock') as string,
      ownerAcc
    )) as unknown as WETH9Mock
    console.log(`Reusing wethMock at ${wethMock.address}`)
  }
})()
