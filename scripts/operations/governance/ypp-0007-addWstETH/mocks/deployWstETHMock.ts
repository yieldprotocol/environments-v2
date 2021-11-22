import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { WSTETH, STETH } from '../../../../../shared/constants'
import { mapToJson, jsonToMap, verify } from '../../../../../shared/helpers'

import WstETHMockArtifact from '../../../../../artifacts/contracts/mocks/WstETHMock.sol/WstETHMock.json'
import { WstETHMock } from '../../../../../typechain/WstETHMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the WstETHMock contract, if not deployed yet
 */

;(async () => {
  const stEthAddress = '0x2296AB4F92f7fADC78eD02A9576B9a779CAa91bE'

  if (hre.network.name === 'mainnet') throw "You shouldn't deploy WstETHMock on mainnet"
  const [ ownerAcc ] = await ethers.getSigners();

  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>

  let wstETH: WstETHMock
  if (assets.get(WSTETH) === undefined) {
    wstETH = (await deployContract(ownerAcc, WstETHMockArtifact, [stEthAddress])) as WstETHMock
    console.log(`WstETHMock, '${wstETH.address}`)
    verify(wstETH.address, [stEthAddress])
    assets.set(WSTETH, wstETH.address)
    fs.writeFileSync('./addresses/assets.json', mapToJson(assets), 'utf8')
    await wstETH.set('1046430920451237951')
  }
})()
