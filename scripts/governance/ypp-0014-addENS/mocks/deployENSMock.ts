import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { ENS } from '../../../../shared/constants'
import { mapToJson, jsonToMap, verify, getOriginalChainId } from '../../../../shared/helpers'

import ERC20MockArtifact from '../../../../../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import { ERC20Mock } from '../../../../typechain/ERC20Mock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ENSMock contract, if not deployed yet
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 42) throw "Only Kovan supported"

  const [ ownerAcc ] = await ethers.getSigners();

  const assets = jsonToMap(fs.readFileSync('./addresses/kovan/assets.json', 'utf8')) as Map<string, string>

  let ens: ERC20Mock
  if (assets.get(ENS) === undefined) {
    const args = ['Ethereum Name Service', 'ENS']
    ens = (await deployContract(ownerAcc, ERC20MockArtifact, args)) as ERC20Mock
    console.log(`ENSMock, '${ens.address}`)
    verify(ens.address, args)
    assets.set(ENS, ens.address)
    fs.writeFileSync('./addresses/kovan/assets.json', mapToJson(assets), 'utf8')
  }
})()
