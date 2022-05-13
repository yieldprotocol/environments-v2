import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../../../../shared/helpers'

import ERC20MockArtifact from '../../../../../../artifacts/contracts/::mocks/ERC20Mock.sol/ERC20Mock.json'
import { ERC20Mock } from '../../../../../../typechain/ERC20Mock'

const { deployContract } = waffle
const { developer } = require(process.env.CONF as string)
/**
 * @dev This script deploys the ERC20Mock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy UNIMock on mainnet"

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  let uniMock: ERC20Mock

  const args = ['Uniswap', 'UNI']
  if (protocol.get('uniMock') === undefined) {
    uniMock = (await deployContract(ownerAcc, ERC20MockArtifact, args)) as ERC20Mock
    console.log(`uniMock deployed at '${uniMock.address}`)
    //Write the address to the file
    verify(uniMock.address, args)
    protocol.set('uniMock', uniMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    uniMock = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      protocol.get('uniMock') as string,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(`Reusing uniMock at ${uniMock.address}`)
  }
})()
