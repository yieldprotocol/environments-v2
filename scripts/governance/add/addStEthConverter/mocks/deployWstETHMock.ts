import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import { verify, writeAddressMap } from '../../../../../shared/helpers'

import WstETHMockArtifact from '../../../../../artifacts/contracts/::mocks/WstETHMock.sol/WstETHMock.json'
import { WstETHMock } from '../../../../../typechain/WstETHMock'
import { STETH } from '../../../../../shared/constants'

const { deployContract } = waffle
const { assets, protocol } = require(process.env.CONF as string)
/**
 * @dev This script deploys the WstETHMock contract
 */

;(async () => {
  const stEthAddress = assets.get(STETH) as string

  if (hre.network.name === 'mainnet') throw "You shouldn't deploy WstETHMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  let wstETH: WstETHMock
  const args = [stEthAddress]
  if (protocol.get('wstethMock') === undefined) {
    wstETH = (await deployContract(ownerAcc, WstETHMockArtifact, args)) as WstETHMock
    console.log(`wstETHMock, '${wstETH.address}`)
    verify(wstETH.address, args)
    protocol.set('wstethMock', wstETH.address)
    writeAddressMap('protocol.json', protocol)
    await wstETH.set('1046430920451237951')
  } else {
    wstETH = (await ethers.getContractAt(
      'WstETHMock',
      protocol.get('wstethMock') as string,
      ownerAcc
    )) as unknown as WstETHMock
    console.log(`Reusing wstethMock at ${wstETH.address}`)
  }
})()
