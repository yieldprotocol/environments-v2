import { ethers, waffle } from 'hardhat'
import { verify, readAddressMappingIfExists, writeAddressMap } from '../../../../../shared/helpers'

import OnChainTestArtifact from '../../../../../artifacts/@yield-protocol/utils-v2/contracts/utils/OnChainTest.sol/OnChainTest.json'
import { OnChainTest } from '../../../../../typechain/OnChainTest'

const { deployContract } = waffle

/**
 * @dev This script deploys the FraxMock contract
 */

;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let onChainTest: OnChainTest

  if (protocol.get('onChainTest') === undefined) {
    onChainTest = (await deployContract(ownerAcc, OnChainTestArtifact)) as OnChainTest
    console.log(`onChainTest deployed at '${onChainTest.address}`)
    //Write the address to the file
    verify(onChainTest.address, [])
    protocol.set('onChainTest', onChainTest.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    onChainTest = (await ethers.getContractAt(
      'OnChainTest',
      protocol.get('onChainTest') as string,
      ownerAcc
    )) as unknown as OnChainTest
    console.log(`Reusing onChainTest at ${onChainTest.address}`)
  }
})()
