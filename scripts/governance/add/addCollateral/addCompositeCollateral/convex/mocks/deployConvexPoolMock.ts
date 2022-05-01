import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../../../../../shared/helpers'

import ConvexPoolMockArtifact from '../../../../../../../artifacts/contracts/mocks/ConvexPoolMock.sol/ConvexPoolMock.json'
import { ConvexPoolMock } from '../../../../../../../typechain/ConvexPoolMock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ConvexPoolMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy ConvexPoolMock on mainnet"

  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  let convexPoolMock: ConvexPoolMock
  if (protocol.get('convexPoolMock') === undefined) {
    const args = [
      protocol.get('crvMock') as string,
      protocol.get('cvx3CrvMock') as string,
      protocol.get('cvxMock') as string,
    ]
    convexPoolMock = (await deployContract(ownerAcc, ConvexPoolMockArtifact, args)) as ConvexPoolMock
    console.log(`ConvexPoolMock deployed at '${convexPoolMock.address}`)
    verify(convexPoolMock.address, args)
    protocol.set('convexPoolMock', convexPoolMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    convexPoolMock = (await ethers.getContractAt(
      'ConvexPoolMock',
      protocol.get('convexPoolMock') as string,
      ownerAcc
    )) as unknown as ConvexPoolMock
    console.log(`Reusing convexPoolMock at ${convexPoolMock.address}`)
  }
})()
