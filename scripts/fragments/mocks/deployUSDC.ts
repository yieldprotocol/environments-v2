import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  getOwnerOrImpersonate,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../shared/helpers'
import USDCMockArtifact from '../../../artifacts/contracts/::mocks/USDCMock.sol/USDCMock.json'

import { USDCMock } from '../../../typechain/USDCMock'
const { deployContract } = waffle
const { developer } = require(process.env.CONF as string)
/**
 * @dev This script deploys a USDC Mock
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy DaiMock on mainnet"

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  let usdcMock: USDCMock

  if (protocol.get('usdcMock') === undefined) {
    usdcMock = (await deployContract(ownerAcc, USDCMockArtifact)) as USDCMock
    console.log(`usdcMock deployed at '${usdcMock.address}`)
    //Write the address to the file
    verify(usdcMock.address, [])
    protocol.set('usdcMock', usdcMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    usdcMock = (await ethers.getContractAt(
      'USDCMock',
      protocol.get('usdcMock') as string,
      ownerAcc
    )) as unknown as USDCMock
    console.log(`Reusing usdcMock at ${usdcMock.address}`)
  }
})()
