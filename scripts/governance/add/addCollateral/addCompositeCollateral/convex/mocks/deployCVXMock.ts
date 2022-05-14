import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../../../../../shared/helpers'

import CVXMockArtifact from '../../../../../../../artifacts/contracts/::mocks/CVXMock.sol/CVXMock.json'
import { CVXMock } from '../../../../../../../typechain/CVXMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CVXMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy CVXMock on mainnet"

  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let cvxMock: CVXMock

  if (protocol.get('CVXMock') === undefined) {
    cvxMock = (await deployContract(ownerAcc, CVXMockArtifact)) as CVXMock
    console.log(`CVXMock deployed at '${cvxMock.address}`)
    //Write the address to the file
    verify(cvxMock.address, [])
    protocol.set('cvxMock', cvxMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    cvxMock = (await ethers.getContractAt('CVXMock', protocol.get('CVXMock') as string, ownerAcc)) as unknown as CVXMock
    console.log(`Reusing CVXMock at ${cvxMock.address}`)
  }
})()
