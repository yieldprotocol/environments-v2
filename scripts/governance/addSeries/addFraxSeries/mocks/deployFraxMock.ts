import { ethers, waffle } from 'hardhat'
import { verify, getOriginalChainId, readAddressMappingIfExists, writeAddressMap } from '../../../../../shared/helpers'

import ERC20MockArtifact from '../../../../../artifacts/contracts/::mocks/ERC20Mock.sol/ERC20Mock.json'
import { ERC20Mock } from '../../../../../typechain/ERC20Mock'

const { deployContract } = waffle

/**
 * @dev This script deploys the FraxMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy FraxMock on mainnet"

  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let fraxMock: ERC20Mock

  let args = ['Frax (FRAX)', 'FRAX']
  if (protocol.get('fraxMock') === undefined) {
    fraxMock = (await deployContract(ownerAcc, ERC20MockArtifact, args)) as ERC20Mock
    console.log(`FraxMock deployed at '${fraxMock.address}`)
    //Write the address to the file
    verify(fraxMock.address, args)
    protocol.set('fraxMock', fraxMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    fraxMock = (await ethers.getContractAt(
      'FraxMock',
      protocol.get('fraxMock') as string,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(`Reusing FraxMock at ${fraxMock.address}`)
  }
})()
