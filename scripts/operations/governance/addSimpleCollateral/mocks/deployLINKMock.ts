import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { LINK } from '../../../../../shared/constants'
import { mapToJson, jsonToMap, verify } from '../../../../../shared/helpers'

import LINKMockArtifact from '../../../../../artifacts/contracts/mocks/LINKMock.sol/LINKMock.json'
import { LINKMock } from '../../../../../typechain/LINKMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the LINKMock contract, if not deployed yet
 */

;(async () => {
  if (hre.network.name === 'mainnet') throw "You shouldn't deploy LINKMock on mainnet"
  const [ ownerAcc ] = await ethers.getSigners();

  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>

  let link: LINKMock
  if (assets.get(LINK) === undefined) {
    const args = ['ChainLink Token', 'LINK']
    link = (await deployContract(ownerAcc, LINKMockArtifact, args)) as LINKMock
    console.log(`linkMock, '${link.address}`)
    verify(link.address, args)
    assets.set(LINK, link.address)
    fs.writeFileSync('./addresses/assets.json', mapToJson(assets), 'utf8')
  }
})()
