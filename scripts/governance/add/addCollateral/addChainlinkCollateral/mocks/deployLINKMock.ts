import { ethers, waffle } from 'hardhat'
import { verify } from '../../../../../../shared/helpers'

import LINKMockArtifact from '../../../../../../artifacts/contracts/::mocks/LINKMock.sol/LINKMock.json'
import { LINKMock } from '../../../../../../typechain/LINKMock'
import {
  getOriginalChainId,
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  writeAddressMap,
} from '../../../../../../shared/helpers'

const { deployContract } = waffle
const { developer } = require(process.env.CONF as string)
/**
 * @dev This script deploys the LINKMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy LinkMock on mainnet"

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  let linkMock: LINKMock

  if (protocol.get('linkMock') === undefined) {
    linkMock = (await deployContract(ownerAcc, LINKMockArtifact)) as LINKMock
    console.log(`linkMock deployed at '${linkMock.address}`)
    //Write the address to the file
    verify(linkMock.address, [])
    protocol.set('linkMock', linkMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    linkMock = (await ethers.getContractAt(
      'LINKMock',
      protocol.get('linkMock') as string,
      ownerAcc
    )) as unknown as LINKMock
    console.log(`Reusing linkMock at ${linkMock.address}`)
  }
})()
