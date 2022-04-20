import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { STETH } from '../../../../shared/constants'
import { mapToJson, jsonToMap, verify } from '../../../../shared/helpers'

import ERC20MockArtifact from '../../../../../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import { ERC20Mock } from '../../../../typechain/ERC20Mock'

const { deployContract } = waffle

/**
 * @dev This script deploys the stETHMock contract, if not deployed yet
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy stETHMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()

  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>

  let stETH: ERC20Mock
  if (assets.get(STETH) === undefined) {
    const args = ['Liquid staked Ether 2.0', 'stETH']
    stETH = (await deployContract(ownerAcc, ERC20MockArtifact, args)) as ERC20Mock
    console.log(`stETHMock, '${stETH.address}`)
    verify(stETH.address, args)
    assets.set(STETH, stETH.address)
    fs.writeFileSync('./addresses/assets.json', mapToJson(assets), 'utf8')
  }
})()
