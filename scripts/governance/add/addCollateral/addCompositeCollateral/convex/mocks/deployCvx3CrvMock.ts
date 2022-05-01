import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../../../../../shared/helpers'

import Cvx3CrvMockArtifact from '../../../../../../../artifacts/contracts/mocks/Cvx3CrvMock.sol/Cvx3CrvMock.json'
import { Cvx3CrvMock } from '../../../../../../../typechain/Cvx3CrvMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the Cvx3CrvMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy cvx3CrvMock on mainnet"

  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let cvx3CrvMock: Cvx3CrvMock
  if (protocol.get('cvx3CrvMock') === undefined) {
    cvx3CrvMock = (await deployContract(ownerAcc, Cvx3CrvMockArtifact)) as Cvx3CrvMock
    console.log(`Cvx3CrvMock deployed at '${cvx3CrvMock.address}`)
    //Write the address to the file
    verify(cvx3CrvMock.address, [])
    protocol.set('cvx3CrvMock', cvx3CrvMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    cvx3CrvMock = (await ethers.getContractAt(
      'Cvx3CrvMock',
      protocol.get('cvx3CrvMock') as string,
      ownerAcc
    )) as unknown as Cvx3CrvMock
    console.log(`Reusing Cvx3CrvMock at ${cvx3CrvMock.address}`)
  }
})()
