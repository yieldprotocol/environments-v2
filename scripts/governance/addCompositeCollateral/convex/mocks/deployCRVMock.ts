import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, verify, writeAddressMap } from '../../../../../shared/helpers'

import CRVMockArtifact from '../../../../../artifacts/contracts/mocks/CRVMock.sol/CRVMock.json'
import { CRVMock } from '../../../../../typechain/CRVMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CRVMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy CRVMock on mainnet"

  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let crvMock: CRVMock

  if (protocol.get('crvMock') === undefined) {
    crvMock = (await deployContract(ownerAcc, CRVMockArtifact)) as CRVMock
    console.log(`CRVMock deployed at '${crvMock.address}`)
    //Write the address to the file
    verify(crvMock.address, [])
    protocol.set('crvMock', crvMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    crvMock = (await ethers.getContractAt('CRVMock', protocol.get('crvMock') as string, ownerAcc)) as unknown as CRVMock
    console.log(`Reusing CRVMock at ${crvMock.address}`)
  }
})()
