import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../shared/helpers'
import DaiMockArtifact from '../../../artifacts/contracts/::mocks/DaiMock.sol/DaiMock.json'

import { DaiMock } from '../../../typechain/DaiMock'
const { deployContract } = waffle
const { developer } = require(process.env.CONF as string)
/**
 * @dev This script deploys a Dai Mock
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy DaiMock on mainnet"

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  let daiMock: DaiMock

  if (protocol.get('daiMock') === undefined) {
    daiMock = (await deployContract(ownerAcc, DaiMockArtifact,[5])) as DaiMock
    console.log(`daiMock deployed at '${daiMock.address}`)
    //Write the address to the file
    verify(daiMock.address, [5])
    protocol.set('daiMock', daiMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    daiMock = (await ethers.getContractAt('DaiMock', protocol.get('daiMock') as string, ownerAcc)) as unknown as DaiMock
    console.log(`Reusing daiMock at ${daiMock.address}`)
  }
})()
